package psycho.euphoria.app;

import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;


public class CustomWebViewClient extends WebViewClient {


    private final MainActivity mContext;

    public CustomWebViewClient(MainActivity context) {
        mContext = context;
    }


    @Override
    public void onPageFinished(WebView view, String url) {
        //  String cookie;
//        if (url.startsWith("https://www.xvideos.com/") && (cookie = CookieManager.getInstance().getCookie(url)) != null) {
//            mContext.setString(MainActivity.KEY_XVIDEOS_COOKIE, cookie);
//        }
        //view.evaluateJavascript(mJsCode, null);
    }


    @Override
    @SuppressWarnings("deprecation")
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        return super.shouldInterceptRequest(view, url);

    }


    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        if ((url.startsWith("https://") || url.startsWith("http://") || url.startsWith("file://"))) {
            view.loadUrl(url);
        }
        return true;
    }

}