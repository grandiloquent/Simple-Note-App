package psycho.euphoria.app;

import android.app.Activity;
import android.os.Bundle;

import java.io.File;

public class ImageViewerActivity extends Activity {
    TouchImageView mTouchImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.fullscreen_image);
        mTouchImageView = findViewById(R.id.iv);

    }


}