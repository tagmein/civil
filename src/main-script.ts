import http, { IncomingMessage, ServerResponse } from 'http'
import { Action } from './lib/card'
import { civil } from './lib/civil'
import { branch, script } from './lib/script'

export const main = script(
 civil
  .setProperty('host')
  .action.implementation('localhost'),
 civil
  .setProperty('port')
  .action.implementation(
   parseInt(
    civil
     .defaultValue('8080')
     .action.implementation(
      civil
       .extractProperty('env', 'PORT')
       .action.implementation(process)
     )
   )
  ),
 civil
  .setProperty('console')
  .action.implementation(console),
 civil.setProperty('http').action.implementation(http),
 civil
  .setProperty('setStatusCode200')
  .action.implementation(
   civil
    .setProperty('statusCode')
    .action.implementation(200)
  ),
 branch((run) =>
  script(
   civil
    .setProperty('responseAction')
    .action.implementation({
     arguments: [
      {
       title: 'req',
       type: 'object',
      },
      {
       title: 'res',
       type: 'object',
      },
     ],
     returnType: 'void',
     implementation(
      req: IncomingMessage,
      res: ServerResponse
     ) {
      run(
       civil.extractProperty('setStatusCode200')
      ).action.implementation(res)
      res.setHeader('Content-Type', 'text/plain')
      res.end('Hello, World!\n')
     },
    } as Action)
  )
 ),
 branch((run) =>
  script(
   civil
    .setProperty('server')
    .action.implementation(
     run(civil.extractProperty('http')).createServer(
      run(
       civil.extractProperty(
        'responseAction',
        'implementation'
       )
      )
     )
    )
  )
 ),
 branch((run) =>
  script(
   civil
    .invokeMethod('server', 'listen')
    .action.implementation(
     run(civil.extractProperty('port')),
     run(civil.extractProperty('host')),
     civil
      .invokeMethod('log')
      .action.implementation(
       `Server running at http://${run(
        civil.extractProperty('host')
       )}:${run(civil.extractProperty('port'))}/`
      )
      .action.implementation.bind(
       undefined,
       run(civil.extractProperty('console'))
      )
    )
  )
 )
)
