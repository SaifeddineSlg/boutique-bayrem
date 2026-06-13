import { Resend } from 'resend'
import type { Order } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderNotification(order: Order & { id: number }): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || !process.env.RESEND_API_KEY) return

  const itemsHtml = order.items
    .map((item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.productName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#7c3aed;">${(item.unitPrice * item.quantity).toFixed(2)} €</td>
      </tr>
    `)
    .join('')

  await resend.emails.send({
    from: 'Boutique Bayrem <onboarding@resend.dev>',
    to: adminEmail,
    subject: `🛒 Nouvelle commande #${order.id} — ${order.firstName} ${order.lastName}`,
    html: `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f7ff;padding:20px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);padding:24px;border-radius:12px;text-align:center;margin-bottom:20px;">
          <h1 style="color:white;margin:0;font-size:24px;">🛒 Nouvelle commande !</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Commande #${order.id}</p>
        </div>

        <div style="background:white;padding:20px;border-radius:12px;margin-bottom:16px;">
          <h2 style="color:#374151;font-size:16px;margin:0 0 12px;">👤 Client</h2>
          <p style="margin:4px 0;"><strong>${order.firstName} ${order.lastName}</strong></p>
          <p style="margin:4px 0;color:#6b7280;">📞 ${order.contact}</p>
          ${order.message ? `<p style="margin:8px 0;color:#6b7280;font-style:italic;">💬 "${order.message}"</p>` : ''}
        </div>

        <div style="background:white;padding:20px;border-radius:12px;margin-bottom:16px;">
          <h2 style="color:#374151;font-size:16px;margin:0 0 12px;">📦 Articles commandés</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Article</th>
                <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Qté</th>
                <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="border-top:2px solid #f0f0f0;padding-top:12px;margin-top:4px;text-align:right;">
            <span style="font-size:20px;font-weight:bold;color:#7c3aed;">${order.totalAmount.toFixed(2)} €</span>
          </div>
        </div>

        <div style="background:#fef9c3;border:1px solid #fde047;padding:12px 16px;border-radius:10px;text-align:center;font-size:14px;color:#854d0e;">
          💰 Paiement en espèces — Remise en main propre aux Mureaux
        </div>

        <p style="text-align:center;margin-top:16px;">
          <a href="${process.env.NEXT_PUBLIC_URL || 'https://boutique-bayrem.vercel.app'}/admin/commandes"
             style="background:linear-gradient(135deg,#8b5cf6,#ec4899);color:white;padding:12px 24px;border-radius:20px;text-decoration:none;font-weight:bold;">
            Voir les commandes →
          </a>
        </p>
      </div>
    `,
  })
}
