export default function RectBlocks({ rectBlocks, primary }) {
  return (
    <>
      {rectBlocks.filter(b => b.position === 'top').map(block => (
        <div key={block.id} className="absolute left-0 right-0 z-[5]" style={{ top: 0, height: block.height, background: `linear-gradient(to bottom, ${primary}${Math.round(block.opacity * 255).toString(16).padStart(2, '0')}, transparent)` }} />
      ))}
      {rectBlocks.filter(b => b.position === 'bottom').map(block => (
        <div key={block.id} className="absolute left-0 right-0 z-[5]" style={{ bottom: 0, height: block.height, background: `linear-gradient(to top, ${primary}${Math.round(block.opacity * 255).toString(16).padStart(2, '0')}, transparent)` }} />
      ))}
    </>
  )
}
