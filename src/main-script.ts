import { IncomingMessage, ServerResponse } from 'http'
import { Action } from './lib/card'
import { civil } from './lib/civil'
import { branch, script } from './lib/script'

export const main = script(
 civil
  .setProperty('host')
  .action.implementation('localhost'),
 branch((run) =>
  script(
   civil.setProperty('port').action.implementation(
    run(
     civil
      .invokeMethod('global', 'parseInt')
      .action.implementation(
       civil
        .defaultValue('8080')
        .action.implementation(
         run(
          civil.extractProperty(
           'global',
           'process',
           'env',
           'PORT'
          )
         )
        ),

       10
      )
    )
   )
  )
 ),
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
     run(
      civil
       .invokeMethod('http', 'createServer')
       .action.implementation(
        run(
         civil.extractProperty(
          'responseAction',
          'implementation'
         )
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
     function () {
      run(
       civil
        .invokeMethod('global', 'console', 'log')
        .action.implementation(
         `Server running at http://${run(
          civil.extractProperty('host')
         )}:${run(civil.extractProperty('port'))}/`
        )
      )
     }
    )
  )
 )
)
