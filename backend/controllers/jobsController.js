const { producer } = require('../config/kafka');
const Job = require('../models/Job');
const io = require('../config/io'); // Importing the io instance

// Create a job
const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    const payloads = [{ topic: 'job_events', messages: JSON.stringify({ event: 'CREATE', data: job }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('job_created', job); // Broadcasting the new job to all WebSocket clients

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single job
const getJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const [updated] = await Job.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const updatedJob = await Job.findByPk(req.params.id);
    const payloads = [{ topic: 'job_events', messages: JSON.stringify({ event: 'UPDATE', data: updatedJob }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('job_updated', updatedJob); // Broadcasting the updated job to all WebSocket clients

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const deleted = await Job.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const payloads = [{ topic: 'job_events', messages: JSON.stringify({ event: 'DELETE', data: { id: req.params.id } }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('job_deleted', { id: req.params.id }); // Broadcasting the deleted job to all WebSocket clients

    res.status(200).json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob
};
