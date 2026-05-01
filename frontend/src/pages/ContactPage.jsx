import { useState, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import ConfirmModal from '../components/ConfirmModal.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.'

  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address.'

  if (!values.message.trim()) errors.message = 'Message is required.'
  else if (values.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.'

  return errors
}

export default function ContactPage() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [touched, setTouched] = useState({ name: false, email: false, message: false })
  const modalRef = useRef(null)

  const errors = useMemo(() => validate(values), [values])
  const isValid = Object.keys(errors).length === 0

  function update(field, val) {
    setValues((p) => ({ ...p, [field]: val }))
  }
  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field]: true }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid) return
    modalRef.current?.open({
      title: 'Send this message?',
      description: `We'll deliver "${values.message.slice(0, 60)}${values.message.length > 60 ? '...' : ''}" from ${values.name}.`,
      confirmLabel: 'Send',
      onConfirm: () => {
        toast.success("Message sent! We'll get back to you soon.")
        setValues({ name: '', email: '', message: '' })
        setTouched({ name: false, email: false, message: false })
      },
    })
  }

  function FieldError({ field }) {
    if (!touched[field] || !errors[field]) return null
    return <p id={`${field}-error`} role="alert" className="mt-1 text-xs text-jojo-magenta">{errors[field]}</p>
  }

  function inputCls(field) {
    const invalid = touched[field] && errors[field]
    return `w-full px-3 py-2 rounded-md border bg-white text-sm focus:outline-none focus:ring-2 transition ${
      invalid
        ? 'border-jojo-magenta focus:ring-jojo-magenta/40'
        : 'border-jojo-gray focus:ring-jojo-pink/40 focus:border-jojo-pink'
    }`
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-jojo-magenta mb-2">Contact</h1>
      <p className="text-sm text-gray-600 mb-6">
        Drop us a Stand message. We promise not to use Killer Queen on it.
      </p>

      <form onSubmit={handleSubmit} noValidate className="bg-white border border-jojo-gray rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">
            Name <span aria-hidden="true" className="text-jojo-pink">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
            className={inputCls('name')}
            placeholder="Jotaro Kujo"
          />
          <FieldError field="name" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
            Email <span aria-hidden="true" className="text-jojo-pink">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
            className={inputCls('email')}
            placeholder="you@example.com"
          />
          <FieldError field="email" />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-1">
            Message <span aria-hidden="true" className="text-jojo-pink">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={values.message}
            onChange={(e) => update('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            aria-invalid={touched.message && !!errors.message}
            aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
            className={inputCls('message')}
            placeholder="Tell us about your favorite Stand..."
          />
          <FieldError field="message" />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="self-start px-6 py-2.5 rounded-full bg-jojo-pink text-white font-bold hover:bg-jojo-magenta transition-colors disabled:bg-jojo-gray disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Send Message
        </button>
      </form>

      <ConfirmModal ref={modalRef} />
    </section>
  )
}
