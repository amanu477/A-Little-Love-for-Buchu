import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Heart, Music2, Pause, Sparkles, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { heroPhoto, musicPath, portraits, sharedPhotos } from '../buchu-content';

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

const confettiColors = ['#9b5262', '#d59f73', '#a6ad84', '#e5cbb0', '#74404c'];

function PhotoCard({
  photo,
  className,
  onOpen,
  testId,
}: {
  photo: Photo;
  className: string;
  onOpen: (photo: Photo) => void;
  testId?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      className={`portrait-card ${className}`}
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Open photo: ${photo.alt}`}
      data-testid={testId}
    >
      {failed ? (
        <span className="portrait-unavailable">Photo unavailable</span>
      ) : (
        <img src={photo.src} alt={photo.alt} loading="lazy" onError={() => setFailed(true)} />
      )}
      {photo.caption && <span className="portrait-caption">{photo.caption}</span>}
    </button>
  );
}

export default function BuchuChapterStory() {
  const [location, setLocation] = useLocation();
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [easterEgg, setEasterEgg] = useState(false);
  const [heartTaps, setHeartTaps] = useState(0);
  const [diagnosticRun, setDiagnosticRun] = useState(false);
  const [diagnosticMessage, setDiagnosticMessage] = useState('');
  const [choice, setChoice] = useState<'yes' | 'little' | 'no' | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicUnavailable, setMusicUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routeMatch = location.match(/^\/chapter\/(\d+)\/?$/);
  const rawStep = routeMatch ? Number(routeMatch[1]) : 1;
  const step = Number.isFinite(rawStep) ? Math.min(10, Math.max(1, rawStep)) : 1;

  const goTo = (chapter: number) => {
    const next = Math.min(10, Math.max(1, chapter));
    setLocation(next === 1 ? '/' : `/chapter/${next}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
        setRevealOpen(false);
      }
      if (lightbox || revealOpen || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight' && step < 10) goTo(step + 1);
      if (event.key === 'ArrowLeft' && step > 1) goTo(step - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, lightbox, revealOpen]);

  useEffect(() => () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
  }, []);

  const openPhoto = (photo: Photo) => setLightbox(photo);

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

  return (
    <main className="chapter-app">
      <header className="chapter-header">
        <button className="chapter-brand" type="button" onClick={() => goTo(1)} aria-label="Return to the first page">
          <span className="brand-heart">♥</span> A little book for Buchu
        </button>
        <div className="chapter-header-actions">
          <button
            className={`chapter-music${musicPlaying ? ' is-playing' : ''}`}
            type="button"
            onClick={toggleMusic}
            aria-label={musicUnavailable ? 'Music unavailable' : musicPlaying ? 'Pause music' : 'Play music'}
            data-testid="button-toggle-music"
          >
            {musicPlaying ? <Pause size={15} /> : <Music2 size={15} />}
            <span>{musicUnavailable ? 'Song unavailable' : musicPlaying ? 'Pause our song' : 'Play our song'}</span>
            <i aria-hidden="true" />
          </button>
          <div className="chapter-count" aria-live="polite" data-testid="status-story-progress">
            <strong>{String(step).padStart(2, '0')}</strong><span> / 10</span>
          </div>
        </div>
        <div className="chapter-progress" aria-hidden="true">
          <span style={{ width: `${step * 10}%` }} />
        </div>
      </header>

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
      <div className={`chapter-page page-${step}`} key={step} aria-label={`Story page ${step} of 10`}>
        {step === 1 && (
          <section className="chapter-scene cover-scene">
            <div className="cover-copy">
              <p className="scene-kicker"><span /> an extremely small production</p>
              <h1>Hey,<br /><em>Buchu.</em><span className="cover-heart">♥</span></h1>
              <p className="cover-subtitle">I made you something.</p>
              <p className="scene-body">Don’t worry... it’s not another serious conversation. 😂</p>
              <button className="scene-link" type="button" onClick={() => goTo(2)} data-testid="button-scroll-to-buchu">
                Come see <span><ArrowDown size={15} /></span>
              </button>
              <p className="cover-signature">made by your developer boyfriend · with extremely sincere intent</p>
            </div>
            <div className="cover-art" aria-label="Portrait collage of Buchu">
              <PhotoCard photo={heroPhoto} className="cover-main-photo" onOpen={openPhoto} testId="button-open-cover-photo" />
              <PhotoCard photo={portraits[14]} className="cover-small-photo" onOpen={openPhoto} />
              <div className="cover-sticker">my very<br />favorite</div>
              <span className="cover-sparkle sparkle-one">✳</span>
              <span className="cover-sparkle sparkle-two">✦</span>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="chapter-scene character-scene">
            <div className="character-copy">
              <p className="scene-kicker">02 · First of all...</p>
              <h2>Meet the<br /><em>main character.</em></h2>
              <p className="scene-body">Abugu to the world. Buchu to me. Beautiful? Obviously. Cute? Unfortunately, yes.</p>
              <p className="handwritten-note">Anyway... let’s continue.</p>
            </div>
            <div className="character-collage" aria-label="A playful collage of Buchu's portraits">
              <PhotoCard photo={portraits[0]} className="character-photo character-photo-one" onOpen={openPhoto} testId="button-open-meet-1" />
              <PhotoCard photo={portraits[1]} className="character-photo character-photo-two" onOpen={openPhoto} testId="button-open-meet-2" />
              <PhotoCard photo={portraits[2]} className="character-photo character-photo-three" onOpen={openPhoto} testId="button-open-meet-3" />
              <PhotoCard photo={portraits[3]} className="character-photo character-photo-four" onOpen={openPhoto} testId="button-open-meet-4" />
              <span className="collage-doodle doodle-one">Buchu!</span>
              <span className="collage-doodle doodle-two">★</span>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="chapter-scene evidence-scene">
            <div className="evidence-copy">
              <p className="scene-kicker">03 · A case supported by evidence</p>
              <h2>Exhibit A:<br />ridiculously <em>cute.</em></h2>
              <p className="scene-body">The jury has reviewed the evidence and is extremely biased.</p>
              <button className="heart-secret" type="button" onClick={handleHeartTap} aria-label={`Heart secret, ${heartTaps} of 5 taps`} data-testid="button-heart-easter-egg">
                <Heart size={16} fill="currentColor" />
                <span>{heartTaps ? `${heartTaps} / 5` : 'A small button with no suspicious agenda'}</span>
              </button>
              {easterEgg && <p className="secret-message" role="status" data-testid="text-heart-easter-egg">Okay, you found the secret. You’re officially too curious. 😂❤️</p>}
            </div>
            <div className="evidence-collage" aria-label="The jury's photo evidence">
              <div className="evidence-thread" aria-hidden="true" />
              <PhotoCard photo={portraits[4]} className="evidence-photo evidence-photo-main" onOpen={openPhoto} testId="button-open-evidence-1" />
              <PhotoCard photo={portraits[5]} className="evidence-photo evidence-photo-side" onOpen={openPhoto} testId="button-open-evidence-2" />
              <PhotoCard photo={portraits[6]} className="evidence-photo evidence-photo-bottom" onOpen={openPhoto} testId="button-open-evidence-3" />
              <span className="evidence-stamp">CASE<br />CLOSED</span>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="chapter-scene memory-scene">
            <div className="memory-heading">
              <p className="scene-kicker">04 · A little space for us</p>
              <h2>Meanwhile...<br /><em>there’s us.</em></h2>
              <p className="scene-body">Some of my favorite moments have you in them.</p>
            </div>
            <div className="memory-ribbon">
              <span className="ribbon-line" aria-hidden="true" />
              <PhotoCard photo={sharedPhotos[0]} className="memory-photo memory-photo-one memory-photo-couple" onOpen={openPhoto} testId="button-open-memory-1" />
              <span className="memory-note">the little things</span>
              <PhotoCard photo={portraits[8]} className="memory-photo memory-photo-two" onOpen={openPhoto} testId="button-open-memory-2" />
              <span className="memory-note memory-note-two">your favorite face</span>
              <PhotoCard photo={portraits[9]} className="memory-photo memory-photo-three" onOpen={openPhoto} testId="button-open-memory-3" />
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="chapter-scene loves-scene">
            <div className="loves-copy">
              <p className="scene-kicker">05 · The short version</p>
              <h2>Things I<br /><em>love about you.</em></h2>
              <p className="scene-body">A few things, in no particular order. (The actual list is much longer.)</p>
            </div>
            <div className="loves-art">
              <PhotoCard photo={portraits[10]} className="love-photo love-photo-one" onOpen={openPhoto} />
              <PhotoCard photo={portraits[11]} className="love-photo love-photo-two" onOpen={openPhoto} />
              <div className="love-list">
                {loveNotes.map((line, index) => (
                  <div className="love-row" key={line}><span>0{index + 1}</span><p>{line}</p></div>
                ))}
                <div className="love-last"><span>Basically, I like you a lot.</span><small>Okay fine. I love you.</small></div>
              </div>
            </div>
          </section>
        )}

        {step === 6 && (
          <section className="chapter-scene moment-scene">
            <div className="moment-copy">
              <p className="scene-kicker">06 · About that little moment...</p>
              <h2>Just a little<br /><em>uncomfortable moment.</em></h2>
              <p className="scene-body">We disagreed. I got a little annoyed. You got a little uncomfortable. And honestly... neither of us needed the drama. 😂</p>
              <p className="scene-body">But one uncomfortable conversation doesn’t change how much you mean to me. I don’t want to be against you. I want us to be on the same side.</p>
              <p className="moment-signoff">Still you. Still me. Still us. ❤️</p>
            </div>
            <div className="moment-portrait">
              <span className="tape tape-top" aria-hidden="true" />
              <PhotoCard photo={sharedPhotos[1]} className="moment-photo moment-photo-couple" onOpen={openPhoto} testId="button-open-moment-photo" />
              <span className="moment-doodle" aria-hidden="true">♡</span>
            </div>
          </section>
        )}

        {step === 7 && (
          <section className="chapter-scene diagnostic-scene">
            <div className="diagnostic-copy">
              <p className="scene-kicker">07 · A completely scientific check-in</p>
              <h2>Running relationship<br /><em>diagnostics...</em></h2>
              <p className="scene-body">The results are in. The science is questionable; the love is not.</p>
              <PhotoCard photo={portraits[13]} className="diagnostic-photo" onOpen={openPhoto} />
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
              <p className="diagnostic-result" role="status" data-testid="status-diagnostic-result">{diagnosticMessage}</p>
              <button className="chapter-button chapter-button-primary" type="button" onClick={() => {
                setDiagnosticRun(true);
                setDiagnosticMessage('> scan complete: love remains infinite.');
              }} data-testid="button-run-diagnostic">
                <Sparkles size={15} /> Run the diagnostics
              </button>
            </div>
          </section>
        )}

        {step === 8 && (
          <section className="chapter-scene question-scene">
            <div className="question-art">
              <PhotoCard photo={portraits[2]} className="question-photo" onOpen={openPhoto} />
              <span className="question-doodle">♡</span>
            </div>
            <div className="question-copy">
              <p className="scene-kicker">08 · Entirely your call</p>
              <h2>Okay, Buchu...<br /><em>let’s settle this scientifically.</em></h2>
              <p className="question-prompt">Are you still mad at me?</p>
              <p className="scene-body">No wrong answer. No timer. Pick what feels true right now, or just keep turning pages.</p>
              <div className="choice-buttons" role="group" aria-label="Choose how you feel about the disagreement">
                <button className="chapter-button" type="button" onClick={() => setChoice('yes')} data-testid="button-choice-yes">Yes 😒</button>
                <button className="chapter-button" type="button" onClick={() => setChoice('little')} data-testid="button-choice-little">A little 🥺</button>
                <button className="chapter-button chapter-button-primary" type="button" onClick={() => setChoice('no')} data-testid="button-choice-no">No ❤️</button>
              </div>
              <div className="choice-result" role="status" aria-live="polite" data-testid="status-forgiveness-response">
                {choice === 'yes' && <><span>Fair enough. 😭</span><span>I’ll accept my temporary punishment.</span><span>But just so you know... I still love you.</span></>}
                {choice === 'little' && 'Okay... we’re making progress. 👀'}
                {choice === 'no' && <><span className="celebration-title">YEEEEES ❤️</span><span>System restored.</span></>}
              </div>
            </div>
          </section>
        )}

        {step === 9 && (
          <section className="chapter-scene letter-scene">
            <div className="letter-heading">
              <p className="scene-kicker">09 · The part I mean most</p>
              <h2>One thing I actually<br /><em>want you to know.</em></h2>
              <PhotoCard photo={portraits[14]} className="letter-photo" onOpen={openPhoto} />
            </div>
            <div className="love-letter">
              <p>I don’t expect us to agree on everything.</p>
              <p>We’re two different people, and sometimes we’re going to misunderstand each other, get annoyed, or have uncomfortable conversations.</p>
              <p>But I never want a small moment to make you forget how much I care about you.</p>
              <p>I love you.</p>
              <p>And even when we’re being stubborn...</p>
              <p>I still choose you.</p>
              <div className="letter-signoff">Always your annoying developer. ❤️</div>
            </div>
          </section>
        )}

        {step === 10 && (
          <section className="chapter-scene final-scene">
            <div className="final-copy">
              <p className="scene-kicker">10 · Before you leave...</p>
              <h2>Before you<br /><em>leave...</em></h2>
              <p className="final-script">one last thing,<br />just for you</p>
              <p className="scene-body">There’s a tiny last surprise, whenever you’re ready.</p>
              <button className="chapter-button chapter-button-primary" type="button" onClick={() => setRevealOpen(true)} data-testid="button-open-final-reveal">
                One last thing <ArrowRight size={15} />
              </button>
              <button className="restart-link" type="button" onClick={() => goTo(1)}>Read it again</button>
            </div>
            <div className="final-collage">
              <PhotoCard photo={sharedPhotos[0]} className="final-hero-photo" onOpen={openPhoto} />
              <PhotoCard photo={portraits[0]} className="final-small-photo" onOpen={openPhoto} />
              <span className="final-seal">for my<br />favorite</span>
            </div>
          </section>
        )}
      </div>

      <nav className="chapter-nav" aria-label="Story page navigation">
        <button className="chapter-arrow" type="button" onClick={() => goTo(step - 1)} disabled={step === 1} aria-label="Previous page" data-testid="button-previous-page">
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <div className="chapter-dots" aria-label={`Page ${step} of 10`}>
          {Array.from({ length: 10 }, (_, index) => (
            <button
              key={index}
              type="button"
              className={step === index + 1 ? 'active' : ''}
              onClick={() => goTo(index + 1)}
              aria-label={`Go to page ${index + 1}`}
              aria-current={step === index + 1 ? 'page' : undefined}
            />
          ))}
        </div>
        <button
          className="chapter-arrow chapter-arrow-next"
          type="button"
          onClick={() => step === 10 ? setRevealOpen(true) : goTo(step + 1)}
          aria-label={step === 10 ? 'Open the final surprise' : 'Next page'}
          data-testid="button-next-page"
        >
          <span>{step === 10 ? 'One last thing' : 'Turn the page'}</span><ArrowRight size={16} />
        </button>
      </nav>

      <footer className="chapter-footer">Made with love, code, and probably too much CSS. 😂❤️</footer>

      {step === 8 && choice === 'no' && (
        <div className="chapter-confetti" aria-hidden="true" data-testid="celebration-not-yet">
          {Array.from({ length: 38 }, (_, index) => (
            <i key={index} style={{
              '--confetti': confettiColors[index % confettiColors.length],
              '--delay': `${(index % 10) * 0.08}s`,
              '--rotate': `${(index * 47) % 180}deg`,
              '--drift': `${((index * 31) % 170) - 85}px`,
              left: `${(index * 37) % 100}%`,
            } as CSSProperties} />
          ))}
        </div>
      )}

      {lightbox && (
        <div className="chapter-lightbox" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setLightbox(null)} data-testid="dialog-photo-lightbox">
          <button className="lightbox-close" type="button" onClick={() => setLightbox(null)} aria-label="Close photo preview" data-testid="button-close-lightbox"><X size={20} /></button>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.alt} />
            {lightbox.caption && <p>{lightbox.caption}</p>}
          </div>
          <span className="lightbox-hint">press escape or tap outside to close</span>
        </div>
      )}

      {revealOpen && (
        <div className="reveal-overlay" role="dialog" aria-modal="true" aria-labelledby="reveal-title" data-testid="dialog-final-reveal">
          <div className="reveal-inner">
            <p className="scene-kicker">for my favorite person</p>
            <h2 id="reveal-title">Buchu <span aria-hidden="true">♥</span></h2>
            <p>If I could give you one thing right now...<br />it would be a hug.</p>
            <PhotoCard photo={sharedPhotos[0]} className="reveal-portrait" onOpen={(photo) => setLightbox(photo)} />
            <p className="reveal-come-here">Come here. 🫂</p>
            <p className="reveal-footer">Made with love, code, and probably too much CSS. 😂❤️</p>
            <button className="chapter-button" type="button" onClick={() => setRevealOpen(false)} data-testid="button-close-final-reveal">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
