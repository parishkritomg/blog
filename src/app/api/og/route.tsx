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
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at 0% 0%, #f3f4f6 0%, #ffffff 50%)',
            position: 'relative',
          }}
        >
          {/* Top Accent Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '8px',
              backgroundColor: '#000000',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              padding: '60px',
            }}
          >
            {/* Left Column: Text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: image ? '55%' : '100%',
                paddingRight: image ? '40px' : '0',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Brand Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '100px',
                    width: 'fit-content',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#000',
                    }}
                  >
                    Parishkrit Bastakoti
                  </span>
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 900,
                    color: '#000',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {title}
                </div>

                {/* Excerpt */}
                {excerpt && (
                  <div
                    style={{
                      fontSize: 28,
                      color: '#525252',
                      lineHeight: 1.5,
                      fontFamily: 'sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {excerpt}
                  </div>
                )}
              </div>

              {/* Author Footer */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
                {avatarBuffer ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                      src={avatarBuffer as any}
                      alt="Parishkrit Bastakoti"
                      style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '50%', 
                          marginRight: '16px',
                          border: '2px solid #e5e7eb',
                      }} 
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#000',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    PB
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                    Parishkrit Bastakoti
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
                    @parishkrit2061
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Image */}
            {image && (
              <div
                style={{
                  width: '45%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Shadow Element (Simulated) */}
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        right: '-10px',
                        bottom: '-10px',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: '24px',
                        filter: 'blur(20px)',
                    }}
                />
                
                {/* The Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#f3f4f6', // Fallback
                  }}
                />
              </div>
            )}
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
