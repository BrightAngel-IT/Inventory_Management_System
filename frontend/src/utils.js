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
      (item, index) => `
        <div style="display: flex; margin-bottom: 8px; font-size: 11px; line-height: 1.2;">
          <div style="width: 20px; font-weight: 700;">${index + 1}</div>
          <div style="flex: 1;">
            <div style="font-weight: 900; text-transform: uppercase; font-size: 12px;">${item.name}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 1px; font-weight: 600;">
              <span style="width: 30%; font-family: monospace;">${item.sku}</span>
              <span style="width: 20%; text-align: center;">${Number(item.quantity).toFixed(3)}</span>
              <span style="width: 25%; text-align: right;">${Number(item.price).toFixed(2)}</span>
              <span style="width: 25%; text-align: right; font-weight: 900;">${Number(item.lineTotal).toFixed(2)}</span>
            </div>
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
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          * { box-sizing: border-box; -webkit-font-smoothing: none; }
          .dashed-line { border-top: 2px dashed #000; margin: 8px 0; }
          .double-dashed-line { border-top: 4px double #000; margin: 10px 0; }
        </style>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; width: 300px; margin: 0 auto; color: #000; line-height: 1.2; font-smooth: never; -webkit-font-smoothing: none;">
        <div style="text-align: center; margin-bottom: 6px; padding-top: 0; margin-top: 2px;">
          <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 1px;">NILMA Alliance (Pvt) Ltd</div>
          <div style="font-size: 8px; font-weight: 800; border-top: 1px solid #000; border-bottom: 1px solid #000; display: inline-block; padding: 1px 6px; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Excellence AcrossDiverse Industries</div>
          <div style="font-size: 10px; font-weight: 700; line-height: 1.1; margin-bottom: 1px;">295, 1/1 Galle Road, Colombo – 6, Sri Lanka</div>
          <div style="font-size: 10px; font-weight: 700;">Tel: +94-742-955-414</div>
        </div>

        <div style="font-size: 11px; margin-bottom: 6px; font-weight: 700;">
          <div style="display: flex; justify-content: space-between;">
            <span>DATE: ${new Date(sale.createdAt).toLocaleDateString()}</span>
            <span>TIME: ${new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 2px;">
            <span>BILL: ${sale.invoiceNumber}</span>
            <span>CASHIER: ${user.name.toUpperCase()}</span>
          </div>
          <div style="margin-top: 2px; border-bottom: 1px solid #000; padding-bottom: 2px;">CUSTOMER: ${sale.customerName.toUpperCase()}</div>
        </div>

        <div style="display: flex; font-weight: 900; font-size: 10px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin-bottom: 8px; text-transform: uppercase;">
          <span style="width: 20px;">NO</span>
          <span style="flex: 1;">ITEM / SKU</span>
          <span style="width: 40px; text-align: center;">QTY</span>
          <span style="width: 55px; text-align: right;">PRICE</span>
          <span style="width: 65px; text-align: right;">AMOUNT</span>
        </div>

        <div style="margin-bottom: 10px;">
          ${rows}
        </div>

        <div class="dashed-line"></div>

        <div style="font-size: 13px; margin-left: 10%; font-weight: 700;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
            <span>GROSS TOTAL:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
            <span>DISCOUNT:</span>
            <span>${Number(sale.discount || 0).toFixed(2)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 18px; margin-top: 4px; border-top: 2px solid #000; padding-top: 4px;">
            <span>NET TOTAL:</span>
            <span>${Number(sale.total).toFixed(2)}</span>
          </div>

          ${sale.paymentMethod === 'split' && sale.splitPayments && sale.splitPayments.length > 0 ? 
            sale.splitPayments.map(p => `
              <div style="display: flex; justify-content: space-between; margin-top: 2px; font-size: 12px; font-weight: 800;">
                <span>PAYMENT (${p.method.toUpperCase()}):</span>
                <span>${Number(p.amount).toFixed(2)}</span>
              </div>
            `).join('') : `
              <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
                <span>PAYMENT (${sale.paymentMethod.toUpperCase()}):</span>
                <span>${Number(receivedAmount || sale.total).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px;">
                <span>BALANCE:</span>
                <span>${balance.toFixed(2)}</span>
              </div>
            `
          }
        </div>

        <div class="double-dashed-line"></div>

        <div style="text-align: center; font-weight: 700;">
          <div style="font-size: 10px; margin-bottom: 6px;">ITEMS: ${sale.items.length} | QTY: ${sale.items.reduce((sum, i) => sum + i.quantity, 0).toFixed(2)}</div>
          <div style="font-weight: 900; margin: 6px 0; font-size: 13px;">*** THANK YOU - VISIT AGAIN ***</div>
          
          <div style="border-top: 1px dashed #000; padding-top: 8px; font-size: 9px; letter-spacing: 0.5px; text-transform: uppercase;">
            System by: <strong>BrightAngel IT Solutions</strong>
          </div>
          <div style="height: 250px;"></div>
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

