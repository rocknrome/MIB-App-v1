const { producer } = require('../config/kafka');
const TeamMember = require('../models/TeamMember');
const io = require('../config/io'); // Importing the io instance

// Create a team member
const createTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.create(req.body);
    const payloads = [{ topic: 'team_member_events', messages: JSON.stringify({ event: 'CREATE', data: teamMember }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('team_member_created', teamMember); // Broadcasting the new team member to all WebSocket clients

    res.status(201).json(teamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all team members
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.findAll();
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single team member
const getTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByPk(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.status(200).json(teamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a team member
const updateTeamMember = async (req, res) => {
  try {
    const [updated] = await TeamMember.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    const updatedTeamMember = await TeamMember.findByPk(req.params.id);
    const payloads = [{ topic: 'team_member_events', messages: JSON.stringify({ event: 'UPDATE', data: updatedTeamMember }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('team_member_updated', updatedTeamMember); // Broadcasting the updated team member to all WebSocket clients

    res.status(200).json(updatedTeamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a team member
const deleteTeamMember = async (req, res) => {
  try {
    const deleted = await TeamMember.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    const payloads = [{ topic: 'team_member_events', messages: JSON.stringify({ event: 'DELETE', data: { id: req.params.id } }), partition: 0 }];
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to send message to Kafka', err);
      } else {
        console.log('Message sent to Kafka', data);
      }
    });

    io.emit('team_member_deleted', { id: req.params.id }); // Broadcasting the deleted team member to all WebSocket clients

    res.status(200).json({ message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeamMember,
  getTeamMembers,
  getTeamMember,
  updateTeamMember,
  deleteTeamMember
};
