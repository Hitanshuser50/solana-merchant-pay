import { withMiddleware, withAuth, withRateLimit } from '../../../utils/auth';
import { PaymentService } from '../../../services/payment';
import { SettlementService } from '../../../services/settlement';

const paymentService = new PaymentService();
const settlementService = new SettlementService();

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleCreatePayment(req, res);
    case 'GET':
      return handleGetPayment(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

async function handleCreatePayment(req, res) {
  try {
    const { amount, inputToken, description, metadata } = req.body;
    const { wallet: merchantWallet } = req.merchant;

    const payment = await paymentService.createPayment({
      amount,
      merchantWallet,
      inputToken,
      description,
      metadata
    });

    return res.status(200).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      error: 'Failed to create payment',
      details: error.message
    });
  }
}

async function handleGetPayment(req, res) {
  try {
    const { paymentId } = req.query;
    const { wallet: merchantWallet } = req.merchant;

    if (!paymentId) {
      return res.status(400).json({
        error: 'Payment ID is required'
      });
    }

    const status = await paymentService.getPaymentStatus(paymentId);

    // If payment is completed, get settlement info
    if (status.status === 'completed') {
      const settlement = await settlementService.getSettlementBalance(merchantWallet);
      status.settlement = settlement;
    }

    return res.status(200).json(status);
  } catch (error) {
    console.error('Error getting payment:', error);
    return res.status(500).json({
      error: 'Failed to get payment status',
      details: error.message
    });
  }
}

// Apply middleware
export default withMiddleware(
  withAuth,
  withRateLimit({ max: 100, window: 60000 })
)(handler);
