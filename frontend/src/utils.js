export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
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

export const exportToCSV = (data, fileName) => {
  if (!data || !data.length) return

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add Headers
  csvRows.push(headers.join(','))

  // Add Data
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header]
      const escaped = String(val).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${fileName}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const printReceipt = (sale, user, receivedAmount = 0) => {
  const receiptWindow = window.open('', '_blank', 'width=450,height=800')

  if (!receiptWindow) return

  const rows = sale.items
    .map(
      (item) => `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: 800; font-size: 14px; text-transform: uppercase;">${item.name}</div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 2px; font-weight: 600;">
            <span style="width: 25%;">${Number(item.quantity).toFixed(3)} Qty</span>
            <span style="width: 25%; text-align: right;">@ ${Number(item.price).toFixed(2)}</span>
            <span style="width: 20%; text-align: right;">Disc: 0%</span>
            <span style="width: 30%; text-align: right; font-weight: 900;">${Number(item.lineTotal).toFixed(2)}</span>
          </div>
        </div>
      `,
    )
    .join('')

  const balance = Math.max(0, receivedAmount - sale.total)
  const subtotal = sale.items.reduce((sum, i) => sum + i.lineTotal, 0)

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt - ${sale.invoiceNumber}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 0.2cm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          * { box-sizing: border-box; -webkit-font-smoothing: none; }
          .dashed-line { border-top: 2px dashed #000; margin: 8px 0; }
          .double-dashed-line { border-top: 4px double #000; margin: 10px 0; }
        </style>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; width: 300px; margin: 0 auto; color: #000; line-height: 1.3; font-smooth: never; -webkit-font-smoothing: none;">
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 28px; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px;">BRIGHT ANGEL</div>
          <div style="font-size: 16px; font-weight: 900;">PREMIUM STOCK FLOW</div>
          <div style="font-size: 13px; margin-top: 6px; font-weight: 700;">No 75, Dehiwala - Mount Lavenia</div>
          <div style="font-size: 13px; font-weight: 700;">Tel: 011-4386651 | WhatsApp: 077-XXXXXXX</div>
        </div>

        <div style="font-size: 12px; margin-bottom: 10px; font-weight: 700;">
          <div style="display: flex; justify-content: space-between;">
            <span>DATE: ${new Date(sale.createdAt).toLocaleDateString()}</span>
            <span>TIME: ${new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>BILL: ${sale.invoiceNumber}</span>
            <span>CASHIER: ${user.name.toUpperCase()}</span>
          </div>
          <div style="margin-top: 2px;">CUSTOMER: ${sale.customerName.toUpperCase()}</div>
        </div>

        <div class="dashed-line"></div>
        <div style="font-size: 12px; display: flex; justify-content: space-between; font-weight: 900; text-transform: uppercase;">
          <span style="width: 25%;">Quantity</span>
          <span style="width: 25%; text-align: right;">Rate</span>
          <span style="width: 20%; text-align: right;">Disc</span>
          <span style="width: 30%; text-align: right;">Amount</span>
        </div>
        <div class="dashed-line"></div>

        <div style="margin: 10px 0;">${rows}</div>

        <div class="dashed-line"></div>

        <div style="font-size: 14px; margin-left: 15%; font-weight: 700;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>GROSS TOTAL:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>DISCOUNT:</span>
            <span>${Number(sale.discount || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>TAX (8%):</span>
            <span>${Number(sale.tax || 0).toFixed(2)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 20px; margin-top: 8px; border-top: 2px solid #000; padding-top: 8px;">
            <span>NET TOTAL:</span>
            <span>${Number(sale.total).toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <span>CASH PAID:</span>
            <span>${Number(receivedAmount || sale.total).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 16px;">
            <span>BALANCE:</span>
            <span>${balance.toFixed(2)}</span>
          </div>
        </div>

        <div class="double-dashed-line"></div>

        <div style="font-size: 12px; text-align: center; font-weight: 700;">
          <div style="margin-bottom: 6px;">NO OF ITEMS: ${sale.items.length} | TOTAL QTY: ${sale.items.reduce((sum, i) => sum + i.quantity, 0).toFixed(2)}</div>
          <div style="font-weight: 900; margin: 12px 0; font-size: 14px;">*** THANK YOU - VISIT AGAIN ***</div>
          <div style="font-size: 11px; margin-bottom: 8px;">Prices are inclusive of all taxes.</div>
          <div style="border: 2px solid #000; padding: 6px; display: inline-block; font-weight: 900; font-size: 13px;">
            SYSTEM BY: BRIGHTANGEL IT SOLUTIONS
          </div>
        </div>

        <script>
          window.focus();
          window.print();
          window.onafterprint = function() { window.close(); };
        </script>
      </body>
    </html>
  `)
  receiptWindow.document.close()
}
