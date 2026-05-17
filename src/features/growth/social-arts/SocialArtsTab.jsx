import { useAuth } from '../../../shared/context/AuthContext'
import { EditorProvider } from './context/EditorContext'
import SocialArtsEditor from './SocialArtsEditor'

export default function SocialArtsTab() {
  const { company } = useAuth()

  return (
    <EditorProvider>
      <SocialArtsEditor company={company} />
    </EditorProvider>
  )
}
