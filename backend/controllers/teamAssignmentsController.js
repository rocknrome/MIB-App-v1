const { producer } = require('../config/kafka');
const TeamAssignment = require('../models/TeamAssignment');

// Create a team assignment
const createTeamAssignment = async (req, res) => {
  try {
    const teamAssignment = await TeamAssignment.create(req.body);
    const payloads = [{ topic: 'team_assignment_events', messages: JSON.stringify({ event: 'CREATE', data: teamAssignment }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });
    res.status(201).json(teamAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all team assignments
const getTeamAssignments = async (req, res) => {
  try {
    const teamAssignments = await TeamAssignment.findAll();
    res.status(200).json(teamAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single team assignment
const getTeamAssignment = async (req, res) => {
  try {
    const teamAssignment = await TeamAssignment.findByPk(req.params.id);
    if (!teamAssignment) {
      return res.status(404).json({ message: 'Team assignment not found' });
    }
    res.status(200).json(teamAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a team assignment
const updateTeamAssignment = async (req, res) => {
  try {
    const [updated] = await TeamAssignment.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Team assignment not found' });
    }
    const updatedTeamAssignment = await TeamAssignment.findByPk(req.params.id);
    const payloads = [{ topic: 'team_assignment_events', messages: JSON.stringify({ event: 'UPDATE', data: updatedTeamAssignment }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });
    res.status(200).json(updatedTeamAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a team assignment
const deleteTeamAssignment = async (req, res) => {
  try {
    const deleted = await TeamAssignment.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Team assignment not found' });
    }
    const payloads = [{ topic: 'team_assignment_events', messages: JSON.stringify({ event: 'DELETE', data: { id: req.params.id } }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });
    res.status(200).json({ message: 'Team assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeamAssignment,
  getTeamAssignments,
  getTeamAssignment,
  updateTeamAssignment,
  deleteTeamAssignment
};
