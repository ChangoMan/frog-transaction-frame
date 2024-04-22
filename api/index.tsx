import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import type { Address } from 'viem'
import { isAddress } from 'viem'
import { baseSepolia } from 'viem/chains'
import { abi } from '../abi.js'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

type State = {
  address: string
}

export const app = new Frog<{ State: State }>({
  basePath: '/api',
  initialState: {
    address: '',
  },
  // Supply a Hub API URL to enable frame verification.
  // hub: pinata(),
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }),
})

app.frame('/', (c) => {
  return c.res({
    action: '/check-address',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Perform a transaction
      </div>
    ),
    intents: [
      <TextInput placeholder="0xAddressToInfect" />,
      <Button>INFECT</Button>,
    ],
  })
})

app.frame('/check-address', (c) => {
  const { inputText, deriveState } = c

  deriveState((prevState) => {
    if (isAddress(inputText || '')) {
      prevState.address = inputText || ''
    }
  })

  return c.res({
    action: '/finish',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        {inputText}
      </div>
    ),
    intents: [<Button.Transaction target="/mint">Mint</Button.Transaction>],
  })
})

app.frame('/finish', (c) => {
  const { transactionId, previousState } = c

  return c.res({
    image: (
      <div
        style={{
          backgroundColor: '#0A0A0B',
          height: '100%',
          width: '100%',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 50,
          paddingTop: 24,
        }}
      >
        <div style={{ display: 'flex' }}> Transaction ID: {transactionId}</div>
        <div style={{ display: 'flex' }}>{previousState.address}</div>
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
