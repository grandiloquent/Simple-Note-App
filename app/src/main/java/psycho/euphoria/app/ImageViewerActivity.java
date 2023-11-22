package psycho.euphoria.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;

import java.io.File;

public class ImageViewerActivity extends Activity {
    TouchImageView mTouchImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.fullscreen_image);
        mTouchImageView = findViewById(R.id.iv);
        Intent intent = getIntent();
        if (intent.getData() != null) {
            Uri file = intent.getData();
            File imageFile = new File(file.getPath());
            Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
            mTouchImageView.setImageBitmap(bitmap);
        }
    }


}