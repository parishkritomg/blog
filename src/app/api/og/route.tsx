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
    const image = imageParam ? new URL(imageParam, request.url).toString() : null;

    // Load avatar image
    // Use the request URL to resolve the absolute path to the favicon
    // This works for both local development, preview deployments, and production
    const avatarUrl = new URL('/favicon_me.png', request.url).toString(); 

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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={avatarUrl}
                        alt="Parishkrit Bastakoti"
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            marginRight: '12px',
                        }} 
                    />
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
