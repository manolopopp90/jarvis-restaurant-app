const { z } = require('zod');

// Tischnummer-Schema (1-12)
const tableNumberSchema = z.number().int().min(1).max(12);

// QR-Scan Schema
const qrScanSchema = z.object({
  tableNumber: tableNumberSchema,
  scanData: z.string().optional().nullable()
});

// Bestell-Item Schema
const orderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  quantity: z.number().int().min(1).max(100),
  extras: z.array(z.string()).optional().default([]),
  specialInstructions: z.string().max(500).optional().nullable()
});

// Bestellung Schema
const orderSchema = z.object({
  tableNumber: tableNumberSchema,
  items: z.array(orderItemSchema).min(1),
  total: z.number().positive(),
  tax: z.number().min(0).optional().default(0),
  specialInstructions: z.string().max(1000).optional().nullable()
});

// Reservierung Schema
const reservationSchema = z.object({
  tableNumber: tableNumberSchema,
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().optional().nullable(),
  customerPhone: z.string().min(5).max(20).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  numberOfGuests: z.number().int().min(1).max(20),
  notes: z.string().max(500).optional().nullable()
});

// Tisch-Status Schema
const tableStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning'])
});

// Bestell-Status Schema
const orderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'])
});

// Validierungs-Helper
function validate(schema, data) {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }
}

module.exports = {
  tableNumberSchema,
  qrScanSchema,
  orderSchema,
  orderItemSchema,
  reservationSchema,
  tableStatusSchema,
  orderStatusSchema,
  validate
};
