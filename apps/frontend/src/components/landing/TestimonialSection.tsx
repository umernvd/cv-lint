import { TESTIMONIAL } from './landing-content'

export default function TestimonialSection(): React.JSX.Element {
  return (
    <section className="w-full max-w-3xl px-margin mt-3xl mb-3xl">
      <div className="rounded-xl border-2 border-foreground/15 bg-white p-xl relative overflow-hidden shadow-sticker transition-all duration-300 ease-bounce hover:-rotate-[0.3deg] hover:scale-[1.01]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary" />
        <div className="mb-lg">
          <span className="material-symbols-outlined text-3xl text-primary/50">format_quote</span>
        </div>
        <blockquote className="text-h3 text-foreground italic font-normal leading-relaxed mb-lg">
          {TESTIMONIAL.quote}
        </blockquote>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">{TESTIMONIAL.name}</span>
          <span className="text-xs text-muted-foreground">{TESTIMONIAL.result}</span>
        </div>
      </div>
    </section>
  )
}
