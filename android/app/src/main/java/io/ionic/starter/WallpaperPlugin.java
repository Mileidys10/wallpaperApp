package io.ionic.starter;

import android.Manifest;
import android.app.WallpaperManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

@CapacitorPlugin(
  name = "Wallpaper",
  permissions = {
    @Permission(strings = { Manifest.permission.SET_WALLPAPER }, alias = "wallpaper")
  }
)
public class WallpaperPlugin extends Plugin {

  private static final String PERMISSION_DENIED = "Permission denied to set wallpaper";
  private static final String WALLPAPER_SET_ERROR = "Error setting wallpaper";
  private static final String INVALID_IMAGE_PATH = "Invalid image path";

  @PluginMethod
  public void setHomeScreenWallpaper(PluginCall call) {
    String imagePath = call.getString("imagePath");
    if (imagePath == null || imagePath.isEmpty()) {
      call.reject(INVALID_IMAGE_PATH);
      return;
    }

    if (!hasWallpaperPermission()) {
      call.reject(PERMISSION_DENIED);
      return;
    }

    try {
      Bitmap bitmap = loadBitmapFromPath(imagePath);
      if (bitmap == null) {
        call.reject("Failed to load image from path: " + imagePath);
        return;
      }

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
      } else {
        wallpaperManager.setBitmap(bitmap);
      }

      JSObject ret = new JSObject();
      ret.put("success", true);
      ret.put("message", "Home screen wallpaper set successfully");
      call.resolve(ret);

    } catch (IOException e) {
      call.reject(WALLPAPER_SET_ERROR + ": " + e.getMessage());
    } catch (Exception e) {
      call.reject("Unexpected error: " + e.getMessage());
    }
  }

  @PluginMethod
  public void setLockScreenWallpaper(PluginCall call) {
    String imagePath = call.getString("imagePath");
    if (imagePath == null || imagePath.isEmpty()) {
      call.reject(INVALID_IMAGE_PATH);
      return;
    }

    if (!hasWallpaperPermission()) {
      call.reject(PERMISSION_DENIED);
      return;
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
      call.reject("Lock screen wallpaper is only supported on Android 7.0 (API 24) and above");
      return;
    }

    try {
      Bitmap bitmap = loadBitmapFromPath(imagePath);
      if (bitmap == null) {
        call.reject("Failed to load image from path: " + imagePath);
        return;
      }

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());
      wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);

      JSObject ret = new JSObject();
      ret.put("success", true);
      ret.put("message", "Lock screen wallpaper set successfully");
      call.resolve(ret);

    } catch (IOException e) {
      call.reject(WALLPAPER_SET_ERROR + ": " + e.getMessage());
    } catch (Exception e) {
      call.reject("Unexpected error: " + e.getMessage());
    }
  }

  @PluginMethod
  public void setBothWallpaper(PluginCall call) {
    String imagePath = call.getString("imagePath");
    if (imagePath == null || imagePath.isEmpty()) {
      call.reject(INVALID_IMAGE_PATH);
      return;
    }

    if (!hasWallpaperPermission()) {
      call.reject(PERMISSION_DENIED);
      return;
    }

    try {
      Bitmap bitmap = loadBitmapFromPath(imagePath);
      if (bitmap == null) {
        call.reject("Failed to load image from path: " + imagePath);
        return;
      }

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        wallpaperManager.setBitmap(bitmap, null, true,
          WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK);
      } else {
        wallpaperManager.setBitmap(bitmap);
      }

      JSObject ret = new JSObject();
      ret.put("success", true);
      ret.put("message", "Wallpaper set for both home and lock screen successfully");
      call.resolve(ret);

    } catch (IOException e) {
      call.reject(WALLPAPER_SET_ERROR + ": " + e.getMessage());
    } catch (Exception e) {
      call.reject("Unexpected error: " + e.getMessage());
    }
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
      requestPermissionForAlias("wallpaper", call, "permissionCallback");
    }
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

  private boolean hasWallpaperPermission() {
    return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SET_WALLPAPER)
      == PackageManager.PERMISSION_GRANTED;
  }

  private Bitmap loadBitmapFromPath(String imagePath) {
    try {
      Context context = getContext();
      InputStream inputStream;

      if (imagePath.startsWith("content://") || imagePath.startsWith("file://")) {
        Uri uri = Uri.parse(imagePath);
        inputStream = context.getContentResolver().openInputStream(uri);
      } else if (imagePath.startsWith("/")) {
        // Absolute path
        return BitmapFactory.decodeFile(imagePath);
      } else {
        // Relative path or asset
        inputStream = context.getAssets().open(imagePath);
      }

      if (inputStream != null) {
        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        inputStream.close();
        return bitmap;
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return null;
  }
}
