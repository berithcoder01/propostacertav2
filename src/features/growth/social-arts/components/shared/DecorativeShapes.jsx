export default function DecorativeShapes({ shapes, primary, secondary }) {
  return (
    <>
      {shapes.includes('circle-tl') && <div className="absolute top-6 left-6 w-16 h-16 rounded-full opacity-20 z-[6]" style={{ background: secondary }} />}
      {shapes.includes('circle-br') && <div className="absolute bottom-24 right-6 w-12 h-12 rounded-full opacity-20 z-[6]" style={{ background: primary }} />}
      {shapes.includes('line-top') && <div className="absolute top-0 left-0 right-0 h-1 z-[6]" style={{ background: `linear-gradient(to right, ${secondary}, transparent)` }} />}
      {shapes.includes('line-bottom') && <div className="absolute bottom-20 left-6 right-6 h-0.5 opacity-30 z-[6]" style={{ background: secondary }} />}
      {shapes.includes('badge') && <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold z-[6]" style={{ background: secondary }}>★</div>}
      {shapes.includes('dots') && <div className="absolute top-1/2 right-6 flex flex-col gap-1 z-[6]">{[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: secondary }} />)}</div>}
      {shapes.includes('corner') && <div className="absolute top-0 left-0 w-16 h-16 opacity-30 z-[6]" style={{ background: `linear-gradient(135deg, ${secondary}, transparent)` }} />}
      {shapes.includes('star') && <div className="absolute top-10 right-10 text-2xl opacity-40 z-[6]" style={{ color: secondary }}>★</div>}
    </>
  )
}
