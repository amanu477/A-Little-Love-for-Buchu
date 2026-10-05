import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight, Heart, Music2, Pause, Play, Sparkles, X } from 'lucide-react';
import { couplePhoto, couplePhotos, heroPhoto, musicPath, portraits } from '../buchu-content';

type Photo = { src: string; alt: string; caption?: string };

const loveNotes = [
  'Your smile.',
  'Your laugh.',
  'Your personality.',
  'The way you are completely yourself.',
  'Your little habits.',
  'Your weirdness. 😂',
  'Just... you.',
];

const diagnosticReadout = [
  { label: 'Cuteness', level: '100%', value: '100%' },
  { label: 'Inside jokes', level: '92%', value: '92%' },
  { label: 'Stubbornness', level: '99%', value: '99%' },
  { label: 'Random conversations', level: '97%', value: '97%' },
  { label: 'Me annoying you', level: '87%', value: '87%' },
  { label: 'Love', level: '100%', value: '∞%' },
];

const celebrationColors = ['#9b5262', '#d59f73', '#a6ad84', '#e5cbb0', '#74404c'];

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function PhotoImage({ photo, className, loading = 'lazy' }: { photo: Photo; className: string; loading?: 'eager' | 'lazy' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`${className} image-fallback`} role="img" aria-label={`${photo.alt} — add the photo here`}><Heart size={19} aria-hidden="true" /><span>A photo to add</span></div>;
  }
  return <img className={className} src={photo.src} alt={photo.alt} loading={loading} onError={() => setFailed(true)} />;
}

export default function BuchuStory() {
  const [step, setStep] = useState(1);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [easterEgg, setEasterEgg] = useState(false);
  const [heartTaps, setHeartTaps] = useState(0);
  const [diagnosticRun, setDiagnosticRun] = useState(false);
  const [diagnosticMessage, setDiagnosticMessage] = useState('');
  const [choice, setChoice] = useState<'yes' | 'little' | 'no' | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [introOpened, setIntroOpened] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicUnavailable, setMusicUnavailable] = useState(false);
  const [coupleImageAvailable, setCoupleImageAvailable] = useState(Boolean(couplePhoto));
  const audioRef = useRef<HTMLAudioElement>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-story-step]'));
      const probe = window.scrollY + window.innerHeight * 0.46;
      let activeStep = 1;
      sections.forEach((section) => {
        if (section.offsetTop <= probe) activeStep = Number(section.dataset.storyStep);
      });
      setStep(Math.min(10, Math.max(1, activeStep)));
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>('.reveal-on-view');
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
        setRevealOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
  }, []);

  const handleHeartTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    const next = heartTaps + 1;
    setHeartTaps(next);
    if (next >= 5) {
      setEasterEgg(true);
      setHeartTaps(0);
    } else {
      tapTimer.current = setTimeout(() => setHeartTaps(0), 1600);
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || musicUnavailable) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
      return;
    }
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicUnavailable(true);
      setMusicPlaying(false);
    }
  };

  const chooseForgiveness = (value: 'yes' | 'little' | 'no') => {
    setChoice(value);
  };

  const openPhoto = (photo: Photo) => setLightbox(photo);

  return (
    <main className="love-site">
      <div className="topline" aria-hidden="true"><span style={{ width: `${step * 10}%` }} /></div>
      <div className="corner-mark">a small note, just for you</div>
      <div className="progress" aria-label={`Story moment ${step} of 10`} data-testid="status-story-progress">
        <strong>{String(step).padStart(2, '0')}</strong><span>/ 10</span>
      </div>

      <audio
        ref={audioRef}
        src={musicPath}
        loop
        preload="none"
        onError={() => { setMusicUnavailable(true); setMusicPlaying(false); }}
        onPause={() => setMusicPlaying(false)}
        onPlay={() => setMusicPlaying(true)}
        aria-label="Optional background music"
      />
      <button
        className={`music-control${musicPlaying ? ' is-playing' : ''}`}
        type="button"
        onClick={toggleMusic}
        aria-label={musicUnavailable ? 'Music unavailable' : musicPlaying ? 'Pause music' : 'Play music'}
        data-testid="button-toggle-music"
      >
        {musicPlaying ? <Pause size={15} /> : <Music2 size={15} />}
        <span>{musicUnavailable ? 'Add our song' : musicPlaying ? 'Pause our song' : 'Play our song'}</span>
        <i className="music-dot" aria-hidden="true" />
      </button>

      <section className="story-section hero" id="intro" data-story-step="1" aria-labelledby="hero-title">
        <div className={`story-inner hero-layout${introOpened ? ' is-opened' : ''}`}>
          <div className="hero-copy">
            <div className="hero-kicker reveal-up"><i aria-hidden="true" /> an extremely small production</div>
            <h1 className="hero-title reveal-up delay-one" id="hero-title">
              <span>Hey,</span><span className="indent">Buchu. <span className="hero-heart">♥</span></span>
            </h1>
            <p className="hero-subtitle reveal-up delay-two">I made you something.</p>
            <p className="body-copy reveal-up delay-two">Don’t worry... it’s not another serious conversation. 😂</p>
            <button className="story-link" type="button" onClick={() => { setIntroOpened(true); goTo('meet-buchu'); }} data-testid="button-scroll-to-buchu">
              Come see <span><ArrowDown size={15} /></span>
            </button>
          </div>
          <div className="hero-image-wrap reveal-up delay-two">
            <PhotoImage className="hero-photo" photo={heroPhoto} loading="eager" />
            <div className="photo-seal" aria-hidden="true">my very<br />favorite</div>
          </div>
        </div>
        <div className="hero-footnote"><b>made by your developer boyfriend</b> · with extremely sincere intent</div>
      </section>

      <section className="story-section meet" id="meet-buchu" data-story-step="2" aria-labelledby="meet-title">
        <div className="story-inner meet-layout">
          <div className="meet-portraits">
            <button className="meet-photo-button" type="button" onClick={() => openPhoto(portraits[0])} aria-label={`Open photo: ${portraits[0].alt}`} data-testid="button-open-meet-feature">
              <PhotoImage className="meet-photo" photo={portraits[0]} />
            </button>
            <p className="meet-feature-caption">{portraits[0].caption}</p>
            <div className="meet-photo-strip">
              {portraits.slice(1, 4).map((photo, index) => (
                <figure key={photo.src}>
                  <button className="photo-button" type="button" onClick={() => openPhoto(photo)} aria-label={`Open photo: ${photo.alt}`} data-testid={`button-open-meet-${index + 1}`}>
                    <PhotoImage className="meet-strip-photo" photo={photo} />
                  </button>
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="meet-copy">
            <div className="eyebrow">02 · First of all...</div>
            <h2 className="display-title" id="meet-title">Meet the<br /><em>main character.</em></h2>
            <p className="body-copy">
              Abugu to the world. Buchu to me. Beautiful? Obviously. Cute? Unfortunately, yes.
            </p>
            <div className="margin-note">Anyway... let’s continue.</div>
          </div>
        </div>
      </section>

      <section className="story-section evidence" id="evidence" data-story-step="3" aria-labelledby="evidence-title">
        <div className="story-inner">
          <div className="eyebrow">03 · A case supported by evidence</div>
          <h2 className="display-title" id="evidence-title">Exhibit A: Evidence<br />that you’re <em>ridiculously cute.</em></h2>
          <p className="body-copy">Click any photo for a closer look. The jury has reviewed the evidence and is extremely biased.</p>
          <div className="evidence-grid">
            {portraits.slice(4).map((photo, index) => (
              <figure className="evidence-item reveal-on-view" key={photo.src}>
                <button className="photo-button" type="button" onClick={() => openPhoto(photo)} aria-label={`Open photo: ${photo.alt}`} data-testid={`button-open-evidence-${index + 1}`}>
                  <PhotoImage className="evidence-photo" photo={photo} />
                </button>
                <figcaption><span>Exhibit {String.fromCharCode(65 + index)}</span><b>{photo.caption}</b></figcaption>
              </figure>
            ))}
          </div>
          <button className="heart-trigger" type="button" onClick={handleHeartTap} aria-label={`Heart button, ${heartTaps} of 5 taps`} data-testid="button-heart-easter-egg">
            <Heart size={15} fill="currentColor" /> <span>{heartTaps > 0 ? `${heartTaps} / 5` : 'A small button with no suspicious agenda'}</span>
          </button>
          {easterEgg && <span className="heart-message" role="status" data-testid="text-heart-easter-egg">Okay, you found the secret. You’re officially too curious. 😂❤️</span>}
        </div>
      </section>

      <section className="story-section gallery" id="gallery" data-story-step="4" aria-labelledby="gallery-title">
        <div className="story-inner">
          <div className="gallery-head">
            <div><div className="eyebrow">04 · A little space for us</div><h2 className="display-title" id="gallery-title">Meanwhile...<br /><em>there’s us.</em></h2></div>
            <p className="body-copy">Some of my favorite moments have you in them.</p>
          </div>
          <div className="memory-grid">
            {couplePhotos.map((src, index) => (
              <div className={`memory-card reveal-on-view${src ? ' has-photo' : ''}`} key={index}>
                {src ? (
                  <button className="photo-button" type="button" onClick={() => openPhoto({ src, alt: 'A photo of Buchu and her boyfriend together' })} aria-label={`Open couple photo ${index + 1}`} data-testid={`button-open-memory-${index + 1}`}>
                    <PhotoImage className="memory-photo" photo={{ src, alt: 'A photo of Buchu and her boyfriend together' }} />
                  </button>
                ) : (
                  <div className="memory-placeholder" role="img" aria-label="Placeholder for a photo of the two of us">
                    <Heart size={18} aria-hidden="true" />
                    <span>Add one of our photos<small>Whenever you like</small></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section loves" id="things-i-love" data-story-step="5" aria-labelledby="love-title">
        <div className="story-inner loves-layout">
          <div>
            <div className="eyebrow">05 · The short version</div>
            <h2 className="display-title" id="love-title">Things I<br /><em>love about you.</em></h2>
            <p className="loves-aside">A few things, in no particular order. (The actual list is much longer.)</p>
          </div>
          <div className="love-list">
            {loveNotes.map((line, index) => (
              <div className="love-row reveal-on-view" key={line}><span>0{index + 1}</span><p>{line}</p></div>
            ))}
            <div className="love-last"><span>Basically, I like you a lot.</span><small>Okay fine. I love you.</small></div>
          </div>
        </div>
      </section>

      <section className="story-section moment" id="little-moment" data-story-step="6" aria-labelledby="moment-title">
        <div className="story-inner moment-card">
          <div className="moment-copy">
            <div className="eyebrow">06 · About that little moment...</div>
            <h2 id="moment-title">Just a little<br /><em>uncomfortable moment.</em></h2>
            <p>
              We disagreed. I got a little annoyed. You got a little uncomfortable. And honestly... neither of us needed the drama. 😂
            </p>
            <p>
              But one uncomfortable conversation doesn’t change how much you mean to me. I don’t want to be against you. I want us to be on the same side.
            </p>
            <p className="moment-signoff">Still you. Still me. Still us. ❤️</p>
          </div>
          <div className="moment-image" aria-label="Reserved space for a photo of the two of us">
            <div className="couple-placeholder"><span>A space for our photo<small>Just the two of us</small></span></div>
          </div>
        </div>
      </section>

      <section className="story-section diagnostic" id="diagnostic" data-story-step="7" aria-labelledby="diagnostic-title">
        <div className="story-inner diagnostic-wrap">
          <div>
            <div className="eyebrow">07 · A completely scientific check-in</div>
            <h2 className="display-title" id="diagnostic-title">Running relationship<br /><em>diagnostics...</em></h2>
            <p className="body-copy">The results are in. The science is questionable; the love is not.</p>
          </div>
          <div className={`diagnostic-panel${diagnosticRun ? ' run' : ''}`} aria-live="polite">
            <p className="meter-title">Relationship diagnostics</p>
            {diagnosticReadout.map((item) => (
              <div className="meter-row" key={item.label}>
                <span>{item.label}</span>
                <div className="meter-track" aria-hidden="true"><i style={{ '--level': item.level } as CSSProperties} /></div>
                <b>{diagnosticRun ? item.value : '—'}</b>
              </div>
            ))}
            <div className="system-status"><span>System status:</span><b>Still completely obsessed with Buchu. ❤️</b></div>
            <div className="diagnostic-result" role="status" data-testid="status-diagnostic-result">{diagnosticMessage}</div>
            <button className="solid-button" type="button" onClick={() => {
              setDiagnosticRun(true);
              setDiagnosticMessage('> scan complete: love remains infinite.');
            }} data-testid="button-run-diagnostic">
              <Sparkles size={15} /> Run the diagnostics
            </button>
          </div>
        </div>
      </section>

      <section className="story-section choice" id="forgiveness" data-story-step="8" aria-labelledby="choice-title">
        <div className="story-inner choice-inner">
          <div className="eyebrow">08 · Entirely your call</div>
          <h2 className="display-title" id="choice-title">Okay, Buchu...<br /><em>let’s settle this scientifically.</em></h2>
          <p className="choice-question">Are you still mad at me?</p>
          <p className="body-copy">No wrong answer. No timer. Pick what feels true right now, or just keep scrolling.</p>
          <div className="choice-buttons" role="group" aria-label="Choose how you feel about the disagreement">
            <button className="outline-button" type="button" onClick={() => chooseForgiveness('yes')} data-testid="button-choice-yes">Yes 😒</button>
            <button className="outline-button" type="button" onClick={() => chooseForgiveness('little')} data-testid="button-choice-little">A little 🥺</button>
            <button className="solid-button" type="button" onClick={() => chooseForgiveness('no')} data-testid="button-choice-no">No ❤️</button>
          </div>
          <div className="choice-result" role="status" aria-live="polite" data-testid="status-forgiveness-response">
            {choice === 'yes' && <><span>Fair enough. 😭</span><span>I’ll accept my temporary punishment.</span><span>But just so you know... I still love you.</span></>}
            {choice === 'little' && 'Okay... we’re making progress. 👀'}
            {choice === 'no' && <><span className="celebration-title">YEEEEES ❤️</span><span>System restored.</span></>}
          </div>
          {choice === 'no' && <button className="story-link choice-continue" type="button" onClick={() => goTo('final-note')} data-testid="button-continue-after-choice">Continue <span><ArrowRight size={15} /></span></button>}
        </div>
      </section>

      <section className="story-section note" id="final-note" data-story-step="9" aria-labelledby="note-title">
        <div className="story-inner note-content">
          <div className="eyebrow">09 · The part I mean most</div>
          <h2 className="display-title" id="note-title">One thing I actually<br /><em>want you to know.</em></h2>
          <div className="note-letter">
            <p>I don’t expect us to agree on everything.</p>
            <p>We’re two different people, and sometimes we’re going to misunderstand each other, get annoyed, or have uncomfortable conversations.</p>
            <p>But I never want a small moment to make you forget how much I care about you.</p>
            <p>I love you.</p>
            <p>And even when we’re being stubborn...</p>
            <p>I still choose you.</p>
            <div className="sign-off">Always your annoying developer. ❤️</div>
          </div>
          <div className="note-photo-placeholder" role="img" aria-label="Placeholder for a photo of the two of us"><Heart size={18} aria-hidden="true" /><span>Our photo goes here<small>Add one whenever you like</small></span></div>
        </div>
      </section>

      <section className="story-section surprise" id="surprise" data-story-step="10" aria-labelledby="surprise-title">
        <div className="story-inner">
          <div className="eyebrow">10 · Before you leave...</div>
          <h2 className="display-title" id="surprise-title">Before you<br /><em>leave...</em></h2>
          <div className="surprise-mark" aria-hidden="true">one last thing, just for you</div>
          <p className="body-copy">There’s a tiny last surprise, whenever you’re ready.</p>
          <button className="solid-button" type="button" onClick={() => setRevealOpen(true)} data-testid="button-open-final-reveal">
            One last thing <ArrowRight size={15} />
          </button>
        </div>
      </section>
      <footer className="site-footer">Made with love, code, and probably too much CSS. 😂❤️</footer>

      {choice === 'no' && (
        <div className="confetti-field" aria-hidden="true" data-testid="celebration-not-yet">
          {Array.from({ length: 38 }, (_, index) => (
            <i key={index} style={{
              '--confetti': celebrationColors[index % celebrationColors.length],
              '--delay': `${(index % 10) * 0.08}s`,
              '--rotate': `${(index * 47) % 180}deg`,
              '--drift': `${((index * 31) % 170) - 85}px`,
              left: `${(index * 37) % 100}%`,
            } as CSSProperties} />
          ))}
        </div>
      )}

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setLightbox(null)} data-testid="dialog-photo-lightbox">
          <button className="lightbox-close" type="button" onClick={() => setLightbox(null)} aria-label="Close photo preview" data-testid="button-close-lightbox"><X size={20} /></button>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <PhotoImage className="lightbox-photo" photo={lightbox} />
            {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
          </div>
          <div className="lightbox-hint">press escape or tap outside to close</div>
        </div>
      )}

      {revealOpen && (
        <div className="reveal-overlay" role="dialog" aria-modal="true" aria-labelledby="reveal-title" data-testid="dialog-final-reveal">
          <div className="reveal-inner">
            <div className="eyebrow">for my favorite person</div>
            <h2 id="reveal-title">Buchu <span aria-hidden="true">♥</span></h2>
            <p>If I could give you one thing right now...<br />it would be a hug.</p>
            <div className="reveal-photo-slot">
              {coupleImageAvailable ? (
                <img src={couplePhoto} alt="A photo of Buchu and her boyfriend together" onError={() => setCoupleImageAvailable(false)} />
              ) : <span><Heart size={20} aria-hidden="true" />Come here. 🫂<small>A place for our photo together</small></span>}
            </div>
            <p className="reveal-footer">Made with love, code, and probably too much CSS. 😂❤️</p>
            <button className="outline-button" type="button" onClick={() => setRevealOpen(false)} data-testid="button-close-final-reveal">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
