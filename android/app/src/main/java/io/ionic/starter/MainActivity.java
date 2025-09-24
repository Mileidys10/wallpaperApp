package io.ionic.starter;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Registrar el plugin personalizado
    this.init(savedInstanceState, (bridge) -> {
      bridge.getPluginManager().addPlugin(WallpaperPlugin.class);
    });
  }
}
