import app from './app';
import html from '../dist/client.html';
import source from '../dist/source.b64';
export default {fetch(request:Request,env:any,ctx:any){return app.fetch(request,{DB:env.DB,HTML:html,SOURCE:source},ctx);}};
