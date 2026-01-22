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
            backgroundColor: 'white',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: image ? '65%' : '100%',
              paddingRight: image ? '40px' : '0',
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                color: 'black',
                lineHeight: 1.1,
                marginBottom: '20px',
                fontFamily: 'sans-serif',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 30,
                color: '#4B5563', // gray-600
                lineHeight: 1.4,
                fontFamily: 'sans-serif',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {excerpt}
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '40px',
                }}
            >
                 {/* Author info or Brand */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {avatarBuffer ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                          src={avatarBuffer as any}
                          alt="Parishkrit Bastakoti"
                          style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              marginRight: '12px',
                          }} 
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'black',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          fontSize: '20px',
                          fontWeight: 'bold',
                        }}
                      >
                        PB
                      </div>
                    )}
                    <div style={{ fontSize: 24, fontWeight: '600', color: 'black' }}>
                        Parishkrit Bastakoti
                    </div>
                </div>
            </div>
          </div>
          
          {image && (
            <div
              style={{
                width: '35%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px',
                }}
              />
            </div>
          )}
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
