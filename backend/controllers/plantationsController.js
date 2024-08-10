const { producer } = require('../config/kafka');
const Plantation = require('../models/Plantation');
const io = require('../config/io'); // Importing the io instance

// Create a plantation
const createPlantation = async (req, res) => {
  try {
    const plantation = await Plantation.create(req.body);
    const payloads = [{ topic: 'plantation_events', messages: JSON.stringify({ event: 'CREATE', data: plantation }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('plantation_created', plantation); // Broadcasting the new plantation to all WebSocket clients

    res.status(201).json(plantation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all plantations
const getPlantations = async (req, res) => {
  try {
    const plantations = await Plantation.findAll();
    res.status(200).json(plantations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single plantation
const getPlantation = async (req, res) => {
  try {
    const plantation = await Plantation.findByPk(req.params.id);
    if (!plantation) {
      return res.status(404).json({ message: 'Plantation not found' });
    }
    res.status(200).json(plantation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a plantation
const updatePlantation = async (req, res) => {
  try {
    const [updated] = await Plantation.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Plantation not found' });
    }
    const updatedPlantation = await Plantation.findByPk(req.params.id);
    const payloads = [{ topic: 'plantation_events', messages: JSON.stringify({ event: 'UPDATE', data: updatedPlantation }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('plantation_updated', updatedPlantation); // Broadcasting the updated plantation to all WebSocket clients

    res.status(200).json(updatedPlantation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a plantation
const deletePlantation = async (req, res) => {
  try {
    const deleted = await Plantation.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Plantation not found' });
    }
    const payloads = [{ topic: 'plantation_events', messages: JSON.stringify({ event: 'DELETE', data: { id: req.params.id } }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('plantation_deleted', { id: req.params.id }); // Broadcasting the deleted plantation to all WebSocket clients

    res.status(200).json({ message: 'Plantation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPlantation,
  getPlantations,
  getPlantation,
  updatePlantation,
  deletePlantation
};
