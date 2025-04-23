package com.example.kernel.commands;

import me.clip.placeholderapi.PlaceholderAPI;
import net.luckperms.api.LuckPerms;
import net.luckperms.api.node.types.InheritanceNode;
import net.luckperms.api.track.Track;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class RankCommand implements CommandExecutor, TabCompleter {
    private final LuckPerms luckPerms;
    private final String STAFF_TRACK = "staff";

    public RankCommand(LuckPerms luckPerms) {
        this.luckPerms = luckPerms;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("help")) {
            showHelp(sender);
            return true;
        }

        String subCommand = args[0].toLowerCase();
        switch (subCommand) {
            case "set":
                if (args.length < 3) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/rank set <player> <rank>"));
                    return true;
                }
                setRank(sender, args[1], args[2]);
                break;
            case "promote":
                if (args.length < 2) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/rank promote <player>"));
                    return true;
                }
                promotePlayer(sender, args[1]);
                break;
            case "demote":
                if (args.length < 2) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/rank demote <player>"));
                    return true;
                }
                demotePlayer(sender, args[1]);
                break;
            case "info":
                if (args.length < 2) {
                    if (!(sender instanceof Player)) {
                        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/rank info <player>"));
                        return true;
                    }
                    showRankInfo(sender, (Player) sender);
                    return true;
                }
                Player target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[1]));
                    return true;
                }
                showRankInfo(sender, target);
                break;
            default:
                showHelp(sender);
                break;
        }
        return true;
    }

    private void showHelp(CommandSender sender) {
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Available commands:"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank help &8- &7Show this help message"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank info [player] &8- &7Show rank information"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank set <player> <rank> &8- &7Set a player's rank"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank promote <player> &8- &7Promote player on staff track"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank demote <player> &8- &7Demote player on staff track"));
    }

    private void showRankInfo(CommandSender sender, Player target) {
        String rankInfo = PlaceholderAPI.setPlaceholders(target, 
            "&8&m                                                &r\n" +
            "&7Rank info for: " + Constants.PRIMARY + "%player_name%\n" +
            "&7Current Rank: " + Constants.PRIMARY + "%luckperms_primary_group_name%\n" +
            "&7Prefix: &f%luckperms_prefix%\n" +
            "&7Tag(s): " + Constants.PRIMARY + "%luckperms_suffix%\n" +
            "&7All Groups: " + Constants.PRIMARY + "%luckperms_groups%\n" +
            "&8&m                                                "
        );
        
        sender.sendMessage(ColorUtils.translateColorCodes(rankInfo));
    }

    private void setRank(CommandSender sender, String targetName, String rankName) {
        if (!sender.hasPermission("kernel.rank.set")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to set ranks."));
            return;
        }

        if (luckPerms.getGroupManager().getGroup(rankName) == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Rank " + Constants.PRIMARY + rankName + " &7doesn't exist."));
            return;
        }

        Player targetPlayer = Bukkit.getPlayer(targetName);
        if (targetPlayer == null) {
            CompletableFuture<UUID> lookupUUID = luckPerms.getUserManager().lookupUniqueId(targetName);
            try {
                UUID targetUUID = lookupUUID.get();
                if (targetUUID == null) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player " + Constants.PRIMARY + targetName + " &7not found."));
                    return;
                }
                setRankOffline(sender, targetUUID, targetName, rankName);
            } catch (Exception e) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Error looking up player: " + e.getMessage()));
            }
            return;
        }

        setRankOnline(sender, targetPlayer, rankName);
    }

    private void setRankOnline(CommandSender sender, Player target, String rankName) {
        String oldRank = luckPerms.getUserManager().getUser(target.getUniqueId()).getPrimaryGroup();
        
        luckPerms.getUserManager().modifyUser(target.getUniqueId(), user -> {
            user.data().clear(node -> node instanceof InheritanceNode);
            user.data().add(InheritanceNode.builder(rankName).build());
        }).thenRun(() -> {
            Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                updatePlayerRank(sender, target, oldRank, rankName);
            });
        });
    }

    private void setRankOffline(CommandSender sender, UUID targetUUID, String targetName, String rankName) {
        luckPerms.getUserManager().modifyUser(targetUUID, user -> {
            String oldRank = user.getPrimaryGroup();
            user.data().clear(node -> node instanceof InheritanceNode);
            user.data().add(InheritanceNode.builder(rankName).build());
            
            Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set " + Constants.PRIMARY + targetName + 
                    "&7's rank from " + Constants.PRIMARY + oldRank + " &7to " + Constants.PRIMARY + rankName + "&7."));
            });
        });
    }

    private void promotePlayer(CommandSender sender, String targetName) {
        if (!sender.hasPermission("kernel.rank.promote")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to promote players."));
            return;
        }

        Player targetPlayer = Bukkit.getPlayer(targetName);
        if (targetPlayer == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player " + Constants.PRIMARY + targetName + " &7must be online."));
            return;
        }

        Track track = luckPerms.getTrackManager().getTrack(STAFF_TRACK);
        if (track == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Staff track not found."));
            return;
        }

        String currentGroup = luckPerms.getUserManager().getUser(targetPlayer.getUniqueId()).getPrimaryGroup();
        int currentIndex = track.getGroups().indexOf(currentGroup);

        if (currentIndex >= track.getGroups().size() - 1) {
            // Use PlaceholderAPI for display name in messages
            String displayRank = PlaceholderAPI.setPlaceholders(targetPlayer, "%luckperms_primary_group_name%");
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + targetName + 
                " &7is already at the highest rank " + Constants.PRIMARY + "(" + displayRank + ")."));
            return;
        }

        String newGroup = track.getGroups().get(currentIndex + 1);
        setRankOnline(sender, targetPlayer, newGroup);
    }

    private void demotePlayer(CommandSender sender, String targetName) {
        if (!sender.hasPermission("kernel.rank.demote")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to demote players."));
            return;
        }

        Player targetPlayer = Bukkit.getPlayer(targetName);
        if (targetPlayer == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player " + Constants.PRIMARY + targetName + " &7must be online."));
            return;
        }

        Track track = luckPerms.getTrackManager().getTrack(STAFF_TRACK);
        if (track == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Staff track not found."));
            return;
        }

        String currentGroup = luckPerms.getUserManager().getUser(targetPlayer.getUniqueId()).getPrimaryGroup();
        int currentIndex = track.getGroups().indexOf(currentGroup);

        if (currentIndex <= 0) {
            // Use PlaceholderAPI for display name in messages
            String displayRank = PlaceholderAPI.setPlaceholders(targetPlayer, "%luckperms_primary_group_name%");
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + targetName + 
                " &7is already at the lowest rank " + Constants.PRIMARY + "(" + displayRank + ")."));
            return;
        }

        String newGroup = track.getGroups().get(currentIndex - 1);
        setRankOnline(sender, targetPlayer, newGroup);
    }

    private void updatePlayerRank(CommandSender sender, Player targetPlayer, String oldRank, String newRank) {
        String oldPrefix = luckPerms.getGroupManager().getGroup(oldRank).getCachedData().getMetaData().getPrefix();
        String newPrefix = luckPerms.getGroupManager().getGroup(newRank).getCachedData().getMetaData().getPrefix();

        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set " + Constants.PRIMARY + targetPlayer.getName() + 
            "&7's rank from &f" + oldPrefix + " &7to &f" + newPrefix + "&7."));
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            return Arrays.asList("set", "help", "promote", "demote", "info").stream()
                    .filter(sc -> sc.toLowerCase().startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (args.length == 2) {
            String subCommand = args[0].toLowerCase();
            if (subCommand.equals("set") || subCommand.equals("promote") || 
                subCommand.equals("demote") || subCommand.equals("info")) {
                return Bukkit.getOnlinePlayers().stream()
                        .map(Player::getName)
                        .filter(name -> name.toLowerCase().startsWith(args[1].toLowerCase()))
                        .collect(Collectors.toList());
            }
        }
        
        if (args.length == 3 && args[0].equalsIgnoreCase("set")) {
            return luckPerms.getGroupManager().getLoadedGroups().stream()
                    .map(group -> group.getName())
                    .filter(name -> name.toLowerCase().startsWith(args[2].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        return new ArrayList<>();
    }
}