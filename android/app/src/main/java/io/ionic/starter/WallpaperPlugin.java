package io.ionic.starter;

import android.Manifest;
import android.app.WallpaperManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(
  name = "Wallpaper",
  permissions = {
    @Permission(strings = { Manifest.permission.SET_WALLPAPER }, alias = "wallpaper")
  }
)
public class WallpaperPlugin extends Plugin {

  private static final String PERMISSION_DENIED = "PERMISSION_DENIED";

  @PluginMethod
  public void setHomeScreenWallpaper(PluginCall call) {
    setWallpaperInternal(call, "home");
  }

  @PluginMethod
  public void setLockScreenWallpaper(PluginCall call) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
      call.reject("Lock screen wallpaper requires Android 7.0 or higher");
      return;
    }
    setWallpaperInternal(call, "lock");
  }

  @PluginMethod
  public void setBothWallpaper(PluginCall call) {
    setWallpaperInternal(call, "both");
  }

  @PluginMethod
  public void checkPermissions(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("granted", hasWallpaperPermission());
    call.resolve(ret);
  }

  @PluginMethod
  public void requestPermissions(PluginCall call) {
    if (hasWallpaperPermission()) {
      JSObject ret = new JSObject();
      ret.put("granted", true);
      call.resolve(ret);
    } else {
      requestPermissionForAlias("wallpaper", call, "handlePermissionResult");
    }
  }

  private void setWallpaperInternal(PluginCall call, String type) {
    String imagePath = call.getString("imagePath");
    if (imagePath == null || imagePath.isEmpty()) {
      call.reject("Image path is required");
      return;
    }

    if (!hasWallpaperPermission()) {
      call.reject("Wallpaper permission not granted");
      return;
    }

    try {
      Bitmap bitmap = loadBitmapFromPath(imagePath);
      if (bitmap == null) {
        call.reject("Failed to load image from: " + imagePath);
        return;
      }

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

      switch (type) {
        case "home":
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
          } else {
            wallpaperManager.setBitmap(bitmap);
          }
          break;

        case "lock":
          wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
          break;

        case "both":
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            wallpaperManager.setBitmap(bitmap, null, true,
              WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK);
          } else {
            wallpaperManager.setBitmap(bitmap);
          }
          break;

        default:
          call.reject("Invalid wallpaper type: " + type);
          return;
      }

      JSObject ret = new JSObject();
      ret.put("success", true);
      ret.put("message", "Wallpaper set successfully for " + type + " screen");
      call.resolve(ret);

    } catch (IOException e) {
      call.reject("IOException: " + e.getMessage());
    } catch (Exception e) {
      call.reject("Unexpected error: " + e.getMessage());
    }
  }

  private boolean hasWallpaperPermission() {
    return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SET_WALLPAPER)
      == PackageManager.PERMISSION_GRANTED;
  }

  private Bitmap loadBitmapFromPath(String imagePath) {
    try {
      Context context = getContext();

      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        // Load from URL
        URL url = new URL(imagePath);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoInput(true);
        connection.connect();
        InputStream inputStream = connection.getInputStream();
        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        inputStream.close();
        connection.disconnect();
        return bitmap;

      } else if (imagePath.startsWith("content://") || imagePath.startsWith("file://")) {
        // Load from content URI or file URI
        Uri uri = Uri.parse(imagePath);
        InputStream inputStream = context.getContentResolver().openInputStream(uri);
        if (inputStream != null) {
          Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
          inputStream.close();
          return bitmap;
        }
      } else if (imagePath.startsWith("/")) {
        // Load from absolute path
        return BitmapFactory.decodeFile(imagePath);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    PluginCall savedCall = getSavedCall();
    if (savedCall == null) {
      return;
    }

    JSObject ret = new JSObject();
    boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
    ret.put("granted", granted);
    savedCall.resolve(ret);
  }
}
