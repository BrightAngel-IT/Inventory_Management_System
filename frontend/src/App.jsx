import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import axios from 'axios'
import _BarcodeReader from 'react-barcode-reader'

const BarcodeReader = _BarcodeReader.default || _BarcodeReader

// Components
import { NoticeBanner } from './components/NoticeBanner'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'

// Pages
import { Login } from './pages/Login'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { CashierDashboard } from './pages/cashier/CashierDashboard'
import { POS } from './pages/cashier/POS'
import { Inventory } from './pages/admin/Inventory'
import { Reports } from './pages/admin/Reports'
import Suppliers from './pages/admin/Suppliers'
import Customers from './pages/admin/Customers'
import Purchases from './pages/admin/Purchases'
import Invoices from './pages/admin/Invoices'
import Payments from './pages/admin/Payments'
import { Notifications } from './pages/admin/Notifications'

// Utils
import {
  authConfig,
  formatCurrency,
  printReceipt,
  readErrorMessage,
  roundCurrency,
} from './utils'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

const demoCredentials = [
  {
    label: 'Admin Demo',
    email: 'admin@brightangel.local',
    password: 'Admin@123',
    role: 'Full reporting and inventory access',
  },
  {
    label: 'Cashier Demo',
    email: 'cashier@brightangel.local',
    password: 'Cashier@123',
    role: 'Billing and stock browsing access',
  },
]

const emptyProductForm = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  description: '',
  unit: 'pcs',
  price: '0',
  costPrice: '0',
  quantityInStock: '0',
  reorderLevel: '0',
  rack: {
    rowNumber: '1',
    columnNumber: '1',
    shelfNumber: '1',
  },
  image: '',
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ims-theme') || 'light')
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('ims-session')
    try {
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [activeView, setActiveView] = useState('overview')
  const [authForm, setAuthForm] = useState({
    email: demoCredentials[0].email,
    password: demoCredentials[0].password,
  })
  const [overview, setOverview] = useState(null)
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [reportRange, setReportRange] = useState('weekly')
  const [report, setReport] = useState(null)
  const [catalogQuery, setCatalogQuery] = useState('')
  const [inventoryQuery, setInventoryQuery] = useState('')
  const [onlyLowStock, setOnlyLowStock] = useState(false)
  const [barcodeValue, setBarcodeValue] = useState('')
  const [cart, setCart] = useState([])
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: 'Walk-in customer',
    paymentMethod: 'cash',
    discount: '0',
    notes: '',
  })
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState('')
  const [pageLoading, setPageLoading] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [notice, setNotice] = useState(null)
  
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ims-read-notifications')) || []
    } catch {
      return []
    }
  })
  const [hasShownPopup, setHasShownPopup] = useState(false)

  const notifications = products
    .filter((p) => p.quantityInStock <= p.reorderLevel)
    .map((p) => ({
      id: `low-stock-${p._id}`,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${p.name} is low on stock (${p.quantityInStock} remaining). Reorder level is ${p.reorderLevel}.`,
      read: readNotifications.includes(`low-stock-${p._id}`)
    }))

  const unreadCount = notifications.filter(n => !n.read).length

  function markNotificationRead(id) {
    setReadNotifications(prev => {
      const next = [...prev, id]
      localStorage.setItem('ims-read-notifications', JSON.stringify(next))
      return next
    })
  }

  function markAllNotificationsRead() {
    const allIds = notifications.map(n => n.id)
    setReadNotifications(allIds)
    localStorage.setItem('ims-read-notifications', JSON.stringify(allIds))
  }

  const deferredCatalogQuery = useDeferredValue(catalogQuery)
  const deferredInventoryQuery = useDeferredValue(inventoryQuery)
  const onRequestError = (error, fallback) => {
    handleRequestError(error, fallback)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ims-theme', theme)
  }, [theme])

  useEffect(() => {
    if (session?.token) {
      localStorage.setItem('ims-session', JSON.stringify(session))
    } else {
      localStorage.removeItem('ims-session')
    }
  }, [session])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => {
      setNotice(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (products.length > 0 && unreadCount > 0 && !hasShownPopup) {
      setNotice({ type: 'warning', text: `You have ${unreadCount} items low on stock. Check notifications.` })
      setHasShownPopup(true)
    }
  }, [products.length, unreadCount, hasShownPopup])

  useEffect(() => {
    if (!session?.token) return

    let isCancelled = false
    async function bootstrap() {
      setPageLoading(true)
      try {
        const [overviewResponse, productsResponse, salesResponse] = await Promise.all([
          api.get('/dashboard/overview', authConfig(session.token)),
          api.get('/products', authConfig(session.token)),
          api.get('/sales', authConfig(session.token)),
        ])
        if (isCancelled) return
        setOverview(overviewResponse.data)
        setProducts(productsResponse.data.products || [])
        setSales(salesResponse.data.sales || [])
      } catch (error) {
        if (isCancelled) return
        onRequestError(error, 'Unable to load the dashboard.')
      } finally {
        if (!isCancelled) setPageLoading(false)
      }
    }
    bootstrap()
    return () => { isCancelled = true }
  }, [session?.token])

  useEffect(() => {
    if (!session?.token || session.user.role !== 'admin') return

    let isCancelled = false
    async function loadReport() {
      try {
        const response = await api.get(
          `/reports/sales?range=${reportRange}`,
          authConfig(session.token),
        )
        if (!isCancelled) setReport(response.data)
      } catch (error) {
        if (!isCancelled) onRequestError(error, 'Unable to load the sales report.')
      }
    }
    loadReport()
    return () => { isCancelled = true }
  }, [reportRange, session?.token, session?.user?.role])

  const catalogProducts = products.filter((product) =>
    `${product.name} ${product.barcode} ${product.sku} ${product.category}`
      .toLowerCase()
      .includes(deferredCatalogQuery.toLowerCase()),
  )

  const inventoryProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.barcode} ${product.sku} ${product.category} ${product.rackLabel}`
      .toLowerCase()
      .includes(deferredInventoryQuery.toLowerCase())
    if (!onlyLowStock) return matchesSearch
    return matchesSearch && product.quantityInStock <= product.reorderLevel
  })

  const cartSubtotal = roundCurrency(
    cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
  )
  const cartTax = roundCurrency(cartSubtotal * 0.08)
  const cartTotal = roundCurrency(cartSubtotal + cartTax - Number(checkoutForm.discount || 0))

  async function refreshCoreData() {
    if (!session?.token) return
    const [overviewResponse, productsResponse, salesResponse] = await Promise.all([
      api.get('/dashboard/overview', authConfig(session.token)),
      api.get('/products', authConfig(session.token)),
      api.get('/sales', authConfig(session.token)),
    ])
    setOverview(overviewResponse.data)
    setProducts(productsResponse.data.products || [])
    setSales(salesResponse.data.sales || [])
  }

  async function handleLogin(event) {
    event.preventDefault()
    setBusyAction('login')
    try {
      const response = await api.post('/auth/login', authForm)
      setSession(response.data)
      startTransition(() => setActiveView('overview'))
      setNotice({ type: 'success', text: `Welcome back, ${response.data.user.name}.` })
    } catch (error) {
      setNotice({ type: 'error', text: readErrorMessage(error, 'Unable to sign in.') })
    } finally {
      setBusyAction('')
    }
  }

  function handleLogout() {
    setSession(null)
    setOverview(null)
    setProducts([])
    setSales([])
    setReport(null)
    setCart([])
    setActiveView('overview')
    setNotice({ type: 'info', text: 'Signed out.' })
  }

  function handleRequestError(error, fallback) {
    const message = readErrorMessage(error, fallback)
    if (error.response?.status === 401) {
      handleLogout()
      setNotice({ type: 'error', text: 'Your session expired.' })
      return
    }
    setNotice({ type: 'error', text: message })
  }

  function addProductToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === product._id)
      if (existing) {
        return currentCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.quantityInStock) }
            : item,
        )
      }
      return [
        ...currentCart,
        {
          productId: product._id,
          name: product.name,
          barcode: product.barcode,
          sku: product.sku,
          price: product.price,
          image: product.image,
          rackLabel: product.rackLabel,
          available: product.quantityInStock,
          quantity: 1,
        },
      ]
    })
  }

  function changeCartQuantity(productId, direction) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.productId !== productId) return item
          const nextQuantity = direction === 'increase' ? item.quantity + 1 : item.quantity - 1
          return { ...item, quantity: Math.max(0, Math.min(nextQuantity, item.available)) }
        })
        .filter((item) => item.quantity > 0),
    )
  }

  function handleBarcodeLookup(scannedValue) {
    const cleanedValue = String(scannedValue || '').trim()
    if (!cleanedValue) return
    setBarcodeValue(cleanedValue)
    startTransition(() => setActiveView('pos'))
    const matchingProduct = products.find((p) => p.barcode === cleanedValue || p.sku === cleanedValue)
    if (!matchingProduct) {
      setCatalogQuery(cleanedValue)
      setNotice({ type: 'warning', text: `No product matched barcode ${cleanedValue}.` })
      return
    }
    addProductToCart(matchingProduct)
    setNotice({ type: 'success', text: `${matchingProduct.name} added to cart.` })
  }

  function handleProductFormChange(event) {
    const { name, value } = event.target
    if (name.startsWith('rack.')) {
      const rackField = name.split('.')[1]
      setProductForm((current) => ({
        ...current,
        rack: { ...current.rack, [rackField]: value },
      }))
      return
    }
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  function startEditingProduct(product) {
    setEditingProductId(product._id)
    setProductForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      description: product.description,
      unit: product.unit,
      price: String(product.price),
      costPrice: String(product.costPrice),
      quantityInStock: String(product.quantityInStock),
      reorderLevel: String(product.reorderLevel),
      rack: {
        rowNumber: String(product.rack.rowNumber),
        columnNumber: String(product.rack.columnNumber),
        shelfNumber: String(product.rack.shelfNumber),
      },
      image: product.image,
    })
    startTransition(() => setActiveView('inventory'))
  }

  function resetProductEditor() {
    setEditingProductId('')
    setProductForm(emptyProductForm)
  }

  async function handleProductSave(event) {
    event.preventDefault()
    setBusyAction('product-save')
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice),
        quantityInStock: Number(productForm.quantityInStock),
        reorderLevel: Number(productForm.reorderLevel),
        rack: {
          rowNumber: Number(productForm.rack.rowNumber),
          columnNumber: Number(productForm.rack.columnNumber),
          shelfNumber: Number(productForm.rack.shelfNumber),
        },
      }
      if (editingProductId) {
        await api.patch(`/products/${editingProductId}`, payload, authConfig(session.token))
      } else {
        await api.post('/products', payload, authConfig(session.token))
      }
      await refreshCoreData()
      resetProductEditor()
      setNotice({ type: 'success', text: 'Product saved successfully.' })
    } catch (error) {
      handleRequestError(error, 'Unable to save product.')
    } finally {
      setBusyAction('')
    }
  }

  async function handleCheckout(event) {
    event.preventDefault()
    if (cart.length === 0) return
    setBusyAction('checkout')
    try {
      const response = await api.post(
        '/sales',
        {
          customerName: checkoutForm.customerName,
          paymentMethod: checkoutForm.paymentMethod,
          discount: Number(checkoutForm.discount || 0),
          tax: cartTax,
          notes: checkoutForm.notes,
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        },
        authConfig(session.token),
      )
      await refreshCoreData()
      setCart([])
      setCheckoutForm({ customerName: 'Walk-in customer', paymentMethod: 'cash', discount: '0', notes: '' })
      printReceipt(response.data.sale, session.user)
      setNotice({ type: 'success', text: 'Sale completed.' })
    } catch (error) {
      handleRequestError(error, 'Checkout failed.')
    } finally {
      setBusyAction('')
    }
  }

  if (!session) {
    return (
      <Login
        theme={theme}
        setTheme={setTheme}
        authForm={authForm}
        setAuthForm={setAuthForm}
        handleLogin={handleLogin}
        busyAction={busyAction}
        demoCredentials={demoCredentials}
        notice={notice}
      />
    )
  }

  return (
    <div className="app-shell">
      <BarcodeReader onError={() => {}} onScan={handleBarcodeLookup} />
      
      <Sidebar
        session={session}
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        setTheme={setTheme}
        handleLogout={handleLogout}
        startTransition={startTransition}
        unreadCount={unreadCount}
      />

      <main className="workspace stack gap-6">
        <Topbar activeView={activeView} session={session} overview={overview} />
        <NoticeBanner notice={notice} />

        {pageLoading && (
          <div className="panel loading-state">
            <div className="spinner" />
            <p>Syncing warehouse data...</p>
          </div>
        )}

        {!pageLoading && (
          <>
            {activeView === 'overview' && session.user.role === 'admin' && (
              <AdminDashboard
                overview={overview}
                session={session}
                setActiveView={setActiveView}
                startTransition={startTransition}
              />
            )}
            {activeView === 'overview' && session.user.role !== 'admin' && (
              <CashierDashboard
                overview={overview}
                session={session}
                setActiveView={setActiveView}
                startTransition={startTransition}
              />
            )}
            {activeView === 'pos' && (
              <POS
                catalogProducts={catalogProducts}
                catalogQuery={catalogQuery}
                setCatalogQuery={setCatalogQuery}
                cart={cart}
                setCart={setCart}
                addProductToCart={addProductToCart}
                changeCartQuantity={changeCartQuantity}
                checkoutForm={checkoutForm}
                setCheckoutForm={setCheckoutForm}
                handleCheckout={handleCheckout}
                busyAction={busyAction}
                cartSubtotal={cartSubtotal}
                cartTax={cartTax}
                cartTotal={cartTotal}
                barcodeValue={barcodeValue}
              />
            )}
            {activeView === 'inventory' && session.user.role === 'admin' && (
              <Inventory
                inventoryProducts={inventoryProducts}
                inventoryQuery={inventoryQuery}
                setInventoryQuery={setInventoryQuery}
                onlyLowStock={onlyLowStock}
                setOnlyLowStock={setOnlyLowStock}
                productForm={productForm}
                handleProductFormChange={handleProductFormChange}
                handleProductSave={handleProductSave}
                startEditingProduct={startEditingProduct}
                resetProductEditor={resetProductEditor}
                editingProductId={editingProductId}
                busyAction={busyAction}
              />
            )}
            {activeView === 'suppliers' && session.user.role === 'admin' && <Suppliers />}
            {activeView === 'customers' && session.user.role === 'admin' && <Customers />}
            {activeView === 'purchases' && session.user.role === 'admin' && <Purchases />}
            {activeView === 'invoices' && session.user.role === 'admin' && <Invoices />}
            {activeView === 'payments' && session.user.role === 'admin' && <Payments />}
            {activeView === 'notifications' && (
              <Notifications
                notifications={notifications}
                markNotificationRead={markNotificationRead}
                markAllNotificationsRead={markAllNotificationsRead}
              />
            )}
            {activeView === 'reports' && session.user.role === 'admin' && (
              <Reports
                report={report}
                reportRange={reportRange}
                setReportRange={setReportRange}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
