import express from 'express';
import nconf from 'nconf';
export default function startExpress() {
  const app = express();
  if (!nconf.get('PORT')) nconf.set('PORT', 5000);
  app.set('port', (nconf.get('PORT')));
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.listen(app.get('port'), () => {
    console.log('Express connected ', app.get('port'));
  });
}
