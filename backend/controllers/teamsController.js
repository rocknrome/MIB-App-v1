const { producer } = require('../config/kafka');
const Team = require('../models/Team');
const io = require('../config/io'); // Importing the io instance

// Create a team
const createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    const payloads = [{ topic: 'team_events', messages: JSON.stringify({ event: 'CREATE', data: team }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('team_created', team); // Broadcasting the new team to all WebSocket clients

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all teams
const getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single team
const getTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a team
const updateTeam = async (req, res) => {
  try {
    const [updated] = await Team.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const updatedTeam = await Team.findByPk(req.params.id);
    const payloads = [{ topic: 'team_events', messages: JSON.stringify({ event: 'UPDATE', data: updatedTeam }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('team_updated', updatedTeam); // Broadcasting the updated team to all WebSocket clients

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a team
const deleteTeam = async (req, res) => {
  try {
    const deleted = await Team.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const payloads = [{ topic: 'team_events', messages: JSON.stringify({ event: 'DELETE', data: { id: req.params.id } }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('team_deleted', { id: req.params.id }); // Broadcasting the deleted team to all WebSocket clients

    res.status(200).json({ message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam
};
