package com.example.kernel.listeners;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.server.ServerListPingEvent;

import com.example.kernel.utils.ColorUtils;

public class MOTDListener implements Listener {
    
    private final String firstLine = "                   &8✪ &#fce9b6&lKERNEL &7• &f1.20+ &8✪";
    private final String secondLine = "     &#D7CFB7ᴛ&#D7CFB5ᴏ&#D7CEB4ʀ&#D7CEB2ᴏ&#D7CDB1᾽&#D7CDAFѕ &#D7CCACᴛ&#D7CCAAᴇ&#D7CBA9ѕ&#D8CBA7ᴛ &#D8CAA4ѕ&#D8CAA2ᴇ&#D8C9A1ʀ&#D8C99Fᴠ&#D8C99Dᴇ&#D8C89Cʀ &#D8C899- &#D8C795ᴘ&#D8C694ʟ&#D8C692ᴜ&#D8C690ɢ&#D8C58Fɪ&#D8C58Dɴ &#D8C48Aᴅ&#D9C488ᴇ&#D9C387ᴠ&#D9C385ᴇ&#D9C284ʟ&#D9C282ᴏ&#D9C280ᴘ&#D9C17Fᴍ&#D9C17Dᴇ&#D9C07Cɴ&#D9C07Aᴛ";

    @EventHandler
    public void onServerListPing(ServerListPingEvent event) {
        String motd = ColorUtils.translateColorCodes(firstLine + "\n" + secondLine);
        event.setMotd(motd);
    }
}