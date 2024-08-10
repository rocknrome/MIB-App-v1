const { producer } = require('../config/kafka');
const JobType = require('../models/JobType');
const io = require('../config/io'); // Importing the io instance

// Create a job type
const createJobType = async (req, res) => {
  try {
    const jobType = await JobType.create(req.body);
    const payloads = [{ topic: 'job_type_events', messages: JSON.stringify({ event: 'CREATE', data: jobType }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('job_type_created', jobType); // Broadcasting the new job type to all WebSocket clients

    res.status(201).json(jobType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all job types
const getJobTypes = async (req, res) => {
  try {
    const jobTypes = await JobType.findAll();
    res.status(200).json(jobTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single job type
const getJobType = async (req, res) => {
  try {
    const jobType = await JobType.findByPk(req.params.id);
    if (!jobType) {
      return res.status(404).json({ message: 'Job type not found' });
    }
    res.status(200).json(jobType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a job type
const updateJobType = async (req, res) => {
  try {
    const [updated] = await JobType.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Job type not found' });
    }
    const updatedJobType = await JobType.findByPk(req.params.id);
    const payloads = [{ topic: 'job_type_events', messages: JSON.stringify({ event: 'UPDATE', data: updatedJobType }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('job_type_updated', updatedJobType); // Broadcasting the updated job type to all WebSocket clients

    res.status(200).json(updatedJobType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a job type
const deleteJobType = async (req, res) => {
  try {
    const deleted = await JobType.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Job type not found' });
    }
    const payloads = [{ topic: 'job_type_events', messages: JSON.stringify({ event: 'DELETE', data: { id: req.params.id } }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('job_type_deleted', { id: req.params.id }); // Broadcasting the deleted job type to all WebSocket clients

    res.status(200).json({ message: 'Job type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJobType,
  getJobTypes,
  getJobType,
  updateJobType,
  deleteJobType
};
