import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { SectionHeading } from '../../components/SectionHeading'

export default function Locations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ rack: '', row: '', column: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchLocations() {
      setLoading(true)
      try {
        const response = await axios.get('/api/locations')
        let data = response.data
        if (!Array.isArray(data)) data = []
        setLocations(data)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.post('/api/locations', form)
      setForm({ rack: '', row: '', column: '' })
      const response = await axios.get('/api/locations')
      let data = response.data
      if (!Array.isArray(data)) data = []
      setLocations(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SectionHeading title="Locations" />
      <form className="panel stack gap-3 mb-6" onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="cluster gap-3">
          <input
            type="text"
            placeholder="Rack"
            value={form.rack}
            onChange={e => setForm(f => ({ ...f, rack: e.target.value }))}
            required
            className="input"
          />
          <input
            type="text"
            placeholder="Row"
            value={form.row}
            onChange={e => setForm(f => ({ ...f, row: e.target.value }))}
            required
            className="input"
          />
          <input
            type="text"
            placeholder="Column"
            value={form.column}
            onChange={e => setForm(f => ({ ...f, column: e.target.value }))}
            required
            className="input"
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Rack</th>
              <th>Row</th>
              <th>Column</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc._id}>
                <td>{loc.rack}</td>
                <td>{loc.row}</td>
                <td>{loc.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
