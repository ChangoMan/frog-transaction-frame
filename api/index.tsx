import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { pinata } from 'frog/hubs'
import { neynar } from 'frog/middlewares'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import type { Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import { abi } from '../abi.js'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  basePath: '/api',
  // Supply a Hub API URL to enable frame verification.
  hub: pinata(),
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  })
)

app.frame('/', (c) => {
  return c.res({
    action: '/finish',
    image: 'https://0bfe-98-98-195-35.ngrok-free.app/og.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction target="/mint">Mint</Button.Transaction>,
      <Button action="/neynar">Neynar</Button>,
    ],
  })
})

app.frame('/neynar', (c) => {
  const { displayName, followerCount, pfpUrl } = c.var.interactor || {}
  console.log('interactor: ', c.var.interactor)
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
          fontSize: 48,
          height: '100%',
          width: '100%',
        }}
      >
        Greetings {displayName}, you have {followerCount} followers.
        <img
          style={{
            width: 200,
            height: 200,
          }}
          src={pfpUrl}
        />
      </div>
    ),
  })
})

app.frame('/finish', (c) => {
  const { transactionId } = c
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Transaction ID: {transactionId}
      </div>
    ),
  })
})

app.transaction('/mint', (c) => {
  const address = c.address as Address
  return c.contract({
    abi,
    functionName: 'claim',
    args: [
      address,
      0n,
      1n,
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      0n,
      {
        proof: [],
        quantityLimitPerWallet: 100n,
        pricePerToken: 0n,
        currency: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      },
      '0x',
    ],
    chainId: `eip155:${baseSepolia.id}`,
    to: '0x858ee7182907599100270328c7a76a2e062F6645',
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
