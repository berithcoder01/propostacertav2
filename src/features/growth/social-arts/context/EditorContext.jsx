import { createContext, useContext, useReducer, useCallback, useRef } from 'react'
import { getInitialFields } from '../data/bannerPresets'

const initialState = {
  preset: null,
  fields: {},
  photo: null,
  photoAlt: null,
  activeTool: 'content',

  background: {
    type: 'gradient',
    color1: null,
    color2: null,
    angle: 135,
    imageUrl: null,
    overlayOpacity: 0.5,
    overlayColor: '#000000',
  },

  layout: {
    spacing: 16,
    offset: { x: 0, y: 0 },
    rectBlocks: [],
  },
  decoration: {
    shapes: [],
    items: [],
  },
  cta: {
    enabled: true,
    text: 'Peça seu orçamento!',
    color: '#E87722',
    textColor: '#ffffff',
    borderRadius: 9999,
    alignment: 'center',
  },
}

function editorReducer(state, action) {
  switch (action.type) {
    case 'SELECT_PRESET': {
      const preset = action.payload
      return {
        ...initialState,
        preset,
        fields: getInitialFields(preset),
      }
    }
    case 'BACK_TO_GALLERY':
      return { ...initialState }
    case 'SET_FIELD':
      return { ...state, fields: { ...state.fields, [action.payload.key]: action.payload.value } }
    case 'SET_PHOTO':
      return { ...state, photo: action.payload }
    case 'SET_PHOTO_ALT':
      return { ...state, photoAlt: action.payload }
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload }
    case 'SET_BACKGROUND':
      return { ...state, background: { ...state.background, ...action.payload } }
    case 'RESET_BACKGROUND':
      return { ...state, background: initialState.background }
    case 'SET_LAYOUT':
      return { ...state, layout: { ...state.layout, ...action.payload } }
    case 'SET_DECORATION':
      return { ...state, decoration: { ...state.decoration, ...action.payload } }
    case 'SET_CTA':
      return { ...state, cta: { ...state.cta, ...action.payload } }
    case 'TOGGLE_SHAPE': {
      const shape = action.payload
      const shapes = state.decoration.shapes.includes(shape)
        ? state.decoration.shapes.filter(s => s !== shape)
        : [...state.decoration.shapes, shape]
      return { ...state, decoration: { ...state.decoration, shapes } }
    }
    case 'ADD_DECORATION': {
      const newItem = {
        id: Date.now(),
        type: action.payload,
        position: 'bottom',
        color: 'secondary',
        opacity: 0.6,
        size: 'md',
      }
      return { ...state, decoration: { ...state.decoration, items: [...state.decoration.items, newItem] } }
    }
    case 'REMOVE_DECORATION':
      return { ...state, decoration: { ...state.decoration, items: state.decoration.items.filter((_, i) => i !== action.payload) } }
    case 'UPDATE_DECORATION': {
      const items = state.decoration.items.map((item, i) =>
        i === action.payload.index ? { ...item, ...action.payload.updates } : item
      )
      return { ...state, decoration: { ...state.decoration, items } }
    }
    case 'ADD_RECT_BLOCK': {
      const block = { id: Date.now(), position: action.payload, height: 80, opacity: 0.3 }
      return { ...state, layout: { ...state.layout, rectBlocks: [...state.layout.rectBlocks, block] } }
    }
    case 'REMOVE_RECT_BLOCK':
      return { ...state, layout: { ...state.layout, rectBlocks: state.layout.rectBlocks.filter(b => b.id !== action.payload) } }
    case 'UPDATE_RECT_BLOCK':
      return { ...state, layout: { ...state.layout, rectBlocks: state.layout.rectBlocks.map(b => b.id === action.payload.id ? { ...b, ...action.payload.updates } : b) } }
    default:
      return state
  }
}

const EditorContext = createContext(null)

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const canvasRef = useRef(null)

  const selectPreset = useCallback((preset) => dispatch({ type: 'SELECT_PRESET', payload: preset }), [])
  const backToGallery = useCallback(() => dispatch({ type: 'BACK_TO_GALLERY' }), [])
  const setField = useCallback((key, value) => dispatch({ type: 'SET_FIELD', payload: { key, value } }), [])
  const setPhoto = useCallback((photo) => dispatch({ type: 'SET_PHOTO', payload: photo }), [])
  const setPhotoAlt = useCallback((photo) => dispatch({ type: 'SET_PHOTO_ALT', payload: photo }), [])
  const setActiveTool = useCallback((tool) => dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool }), [])
  const setBackground = useCallback((updates) => dispatch({ type: 'SET_BACKGROUND', payload: updates }), [])
  const resetBackground = useCallback(() => dispatch({ type: 'RESET_BACKGROUND' }), [])
  const setLayout = useCallback((updates) => dispatch({ type: 'SET_LAYOUT', payload: updates }), [])
  const setDecoration = useCallback((updates) => dispatch({ type: 'SET_DECORATION', payload: updates }), [])
  const setCta = useCallback((updates) => dispatch({ type: 'SET_CTA', payload: updates }), [])
  const toggleShape = useCallback((shape) => dispatch({ type: 'TOGGLE_SHAPE', payload: shape }), [])
  const addDecoration = useCallback((type) => dispatch({ type: 'ADD_DECORATION', payload: type }), [])
  const removeDecoration = useCallback((index) => dispatch({ type: 'REMOVE_DECORATION', payload: index }), [])
  const updateDecoration = useCallback((index, updates) => dispatch({ type: 'UPDATE_DECORATION', payload: { index, updates } }), [])
  const addRectBlock = useCallback((position) => dispatch({ type: 'ADD_RECT_BLOCK', payload: position }), [])
  const removeRectBlock = useCallback((id) => dispatch({ type: 'REMOVE_RECT_BLOCK', payload: id }), [])
  const updateRectBlock = useCallback((id, updates) => dispatch({ type: 'UPDATE_RECT_BLOCK', payload: { id, updates } }), [])

  return (
    <EditorContext.Provider value={{
      state,
      canvasRef,
      actions: {
        selectPreset, backToGallery, setField, setPhoto, setPhotoAlt, setActiveTool,
        setBackground, resetBackground, setLayout, setDecoration, setCta, toggleShape,
        addDecoration, removeDecoration, updateDecoration,
        addRectBlock, removeRectBlock, updateRectBlock,
      },
    }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) throw new Error('useEditor must be used within EditorProvider')
  return context
}
