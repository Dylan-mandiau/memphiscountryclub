'use client'

import { useEffect, useState } from 'react'
import { useField, useFormFields, FieldLabel } from '@payloadcms/ui'
import { slugify } from '../../lib/slugify'

type Props = {
  path: string
  field: {
    name: string
    label?: string | { fr?: string; en?: string }
    required?: boolean
    admin?: {
      custom?: { sourceField?: string }
      description?: string
    }
  }
}

/**
 * Champ slug auto-rempli depuis un autre champ du formulaire (en temps réel).
 *
 * Activation dans une collection :
 *   {
 *     name: 'slug',
 *     type: 'text',
 *     admin: {
 *       custom: { sourceField: 'nom' },   // ← champ source à écouter
 *       components: {
 *         Field: '@/components/admin/SlugField',
 *       },
 *     },
 *   }
 *
 * Logique :
 * - Tant que l'utilisateur n'a pas touché manuellement au champ slug,
 *   on le synchronise avec slugify(sourceValue) à chaque frappe.
 * - Dès que l'utilisateur édite le slug à la main, on arrête de le
 *   réécraser (respect de la saisie manuelle).
 */
export const SlugField: React.FC<Props> = ({ path, field }) => {
  const sourceField = field?.admin?.custom?.sourceField || 'nom'
  const { value, setValue, errorMessage, showError } = useField<string>({ path })
  const [userTouched, setUserTouched] = useState(false)

  const sourceValue = useFormFields(([fields]) => {
    const f = fields[sourceField]
    return typeof f?.value === 'string' ? f.value : ''
  })

  useEffect(() => {
    if (userTouched) return
    if (!sourceValue) return
    const next = slugify(sourceValue)
    if (next !== value) setValue(next)
    // setValue est stable, on l'omet pour éviter une dépendance instable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceValue, userTouched])

  const labelText =
    typeof field?.label === 'string'
      ? field.label
      : field?.label?.fr || field?.label?.en || 'Slug'

  return (
    <div className={`field-type text ${showError ? 'error' : ''}`}>
      <FieldLabel htmlFor={path} label={labelText} required={field?.required} />
      <div className="field-type__wrap">
        <input
          type="text"
          id={path}
          name={path}
          value={value || ''}
          onChange={(e) => {
            setValue(e.target.value)
            setUserTouched(true)
          }}
          onBlur={() => {
            // Si le user efface le slug, on permet de réactiver l'auto
            if (!value) setUserTouched(false)
          }}
          className="field-text"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--theme-elevation-150, #d3d3d3)',
            borderRadius: 'var(--style-radius-s, 4px)',
            background: 'var(--theme-input-bg, #fff)',
            color: 'var(--theme-text, #000)',
            fontSize: 'var(--font-body-size, 1rem)',
            fontFamily: 'inherit',
          }}
        />
      </div>
      {showError && errorMessage && (
        <div
          className="field-error"
          style={{
            color: 'var(--theme-error-500, #dc2626)',
            marginTop: 4,
            fontSize: '0.875rem',
          }}
        >
          {errorMessage}
        </div>
      )}
      {field?.admin?.description && (
        <p
          className="field-description"
          style={{
            marginTop: 4,
            fontSize: '0.85rem',
            color: 'var(--theme-elevation-500, #6b7280)',
          }}
        >
          {field.admin.description}
        </p>
      )}
    </div>
  )
}

export default SlugField
