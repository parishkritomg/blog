import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic params
    const title = searchParams.get('title') || 'Blog Post';
    const excerpt = searchParams.get('excerpt') || '';
    const imageParam = searchParams.get('image');
    
    // Ensure image URL is absolute for ImageResponse
    // If it's already absolute, new URL() handles it. If relative, it uses request.url as base.
    const image = imageParam ? new URL(imageParam, request.url).toString() : null;

    // Load avatar image
    // We fetch it and convert to ArrayBuffer for Satori
    // We use the deployment URL or fallback to the site URL
    let avatarBuffer: ArrayBuffer | null = null;
    try {
        const avatarUrl = new URL('/favicon_me.png', request.url);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        
        const res = await fetch(avatarUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            avatarBuffer = await res.arrayBuffer();
        } else {
            console.error('Failed to fetch avatar:', res.status, res.statusText);
        }
    } catch (e) {
        console.error('Error fetching avatar:', e);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090b', // zinc-950
            position: 'relative',
          }}
        >
          {/* Background Image or Pattern */}
          {image ? (
            <img
              src={image}
              alt="Background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.8,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(to bottom right, #18181b, #000000)',
                display: 'flex',
              }}
            />
          )}

          {/* Gradient Overlay for readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.95) 90%)',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              height: '100%',
              width: '100%',
              padding: '60px 80px', // More horizontal padding
            }}
          >
            {/* Top Brand Tag */}
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '80px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '100px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Parishkrit Bastakoti
              </div>
            </div>

            {/* Main Title Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  fontFamily: 'sans-serif',
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                {title}
              </div>
              
              {excerpt && (
                <div
                  style={{
                    fontSize: 32,
                    color: '#e5e7eb', // gray-200
                    lineHeight: 1.4,
                    fontFamily: 'sans-serif',
                    maxWidth: '90%',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    opacity: 0.9,
                  }}
                >
                  {excerpt}
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '32px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {avatarBuffer ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                          src={avatarBuffer as any}
                          alt="Parishkrit Bastakoti"
                          style={{ 
                              width: '56px', 
                              height: '56px', 
                              borderRadius: '50%', 
                              marginRight: '20px',
                              border: '2px solid rgba(255,255,255,0.8)',
                          }} 
                      />
                    ) : (
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          color: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '20px',
                          fontSize: '24px',
                          fontWeight: 'bold',
                        }}
                      >
                        PB
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>
                            Parishkrit Bastakoti
                        </div>
                        <div style={{ fontSize: 16, color: '#d1d5db', marginTop: '4px', fontWeight: 500 }}>
                            blog.parishkrit.com.np
                        </div>
                    </div>
                </div>

                {/* Optional "Read Post" visual cue */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '12px 24px',
                    borderRadius: '100px',
                    color: 'black',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Read Post &rarr;
                </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
