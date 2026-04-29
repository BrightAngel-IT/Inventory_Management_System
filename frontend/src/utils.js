export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export const formatDate = (value) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const readErrorMessage = (error, fallback) => {
  return error.response?.data?.message || fallback
}

export const roundCurrency = (value) => {
  return Number(Number(value || 0).toFixed(2))
}

export const authConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const printReceipt = (sale, user) => {
  const receiptWindow = window.open('', '_blank', 'width=900,height=700')

  if (!receiptWindow) {
    return
  }

  const rows = sale.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #d4d4d8;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #d4d4d8;">${item.rack.rowNumber}-${item.rack.columnNumber}-${item.rack.shelfNumber}</td>
          <td style="padding:8px 0;border-bottom:1px solid #d4d4d8;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #d4d4d8;text-align:right;">${formatCurrency(item.price)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #d4d4d8;text-align:right;">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `,
    )
    .join('')

  receiptWindow.document.write(`
    <html>
      <head>
        <title>${sale.invoiceNumber}</title>
      </head>
      <body style="font-family:Segoe UI, Arial, sans-serif;padding:32px;color:#18181b;">
        <div style="max-width:860px;margin:0 auto;">
          <h1 style="margin:0 0 8px;">BrightAngel Stock Flow</h1>
          <p style="margin:0 0 24px;color:#52525b;">Retail invoice and bill print sheet</p>
          <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:24px;">
            <div>
              <strong>Invoice:</strong> \${sale.invoiceNumber}<br />
              <strong>Customer:</strong> \${sale.customerName}<br />
              <strong>Payment:</strong> \${sale.paymentMethod}
            </div>
            <div style="text-align:right;">
              <strong>Cashier:</strong> \${user.name}<br />
              <strong>Date:</strong> \${formatDate(sale.createdAt)}<br />
              <strong>Notes:</strong> \${sale.notes || 'None'}
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="text-align:left;">
                <th style="padding:8px 0;border-bottom:2px solid #18181b;">Item</th>
                <th style="padding:8px 0;border-bottom:2px solid #18181b;">Rack</th>
                <th style="padding:8px 0;border-bottom:2px solid #18181b;text-align:center;">Qty</th>
                <th style="padding:8px 0;border-bottom:2px solid #18181b;text-align:right;">Rate</th>
                <th style="padding:8px 0;border-bottom:2px solid #18181b;text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>\${rows}</tbody>
          </table>
          <div style="margin-top:24px;margin-left:auto;max-width:320px;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <span>Subtotal</span>
              <strong>\${formatCurrency(sale.subtotal)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <span>Tax</span>
              <strong>\${formatCurrency(sale.tax)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <span>Discount</span>
              <strong>\${formatCurrency(sale.discount)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #18181b;font-size:20px;">
              <span>Total</span>
              <strong>\${formatCurrency(sale.total)}</strong>
            </div>
          </div>
        </div>
      </body>
    </html>
  `)
  receiptWindow.document.close()
  receiptWindow.focus()
  receiptWindow.print()
}
