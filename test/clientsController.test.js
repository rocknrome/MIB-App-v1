import { expect } from 'chai';
import sinon from 'sinon';

// Importing the CommonJS module
import * as clientsControllerModule from '../backend/controllers/clientsController.js';

// Extract the `createClient` function from the imported module
const { createClient } = clientsControllerModule;

describe('Clients Controller', () => {
  let req, res, poolStub, producerStub, ioStub;

  beforeEach(() => {
    poolStub = { query: sinon.stub() };
    producerStub = { send: sinon.stub() };
    ioStub = { emit: sinon.stub() };

    req = {
      body: {
        last_name: 'Doe',
        first_name: 'John',
        street_address: '123 Main St',
        city: 'Somewhere',
        state: 'CA',
        zip: '90210',
        tags: ['VIP'],
        phone: '555-5555',
        email: 'john@example.com',
        tax_exempt: true,
        admin_notes: 'Important client',
        team_notes: 'Handle with care',
        latitude: '34.0522',
        longitude: '-118.2437',
        plantation_id: 1,
        weekly: true,
        client_type: 'residential',
        payment_method: 'credit card',
        credit_card_number: '4111111111111111',
        credit_card_expiry: '12/24',
        credit_card_cvv: '123',
        billing_address_same: true,
        billing_street_address: '123 Main St',
        billing_city: 'Somewhere',
        billing_state: 'CA',
        billing_zip: '90210'
      }
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      send: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new client and return the client object', async () => {
    const clientData = { id: 1, ...req.body };
    poolStub.query.resolves({ rows: [clientData] });

    const createClientHandler = createClient({ pool: poolStub, producer: producerStub, io: ioStub });
    await createClientHandler(req, res);

    expect(poolStub.query.calledOnce).to.be.true;
    expect(producerStub.send.calledOnce).to.be.true;
    expect(ioStub.emit.calledOnce).to.be.true; // Checking that io.emit was called
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(clientData)).to.be.true;
  });

  it('should handle errors when creating a new client', async () => {
    const error = new Error('Database error');
    poolStub.query.rejects(error);

    const createClientHandler = createClient({ pool: poolStub, producer: producerStub, io: ioStub });
    await createClientHandler(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.send.calledWith('Server error')).to.be.true;
  });
});
