package com.example.kernel.commands;

import net.luckperms.api.LuckPerms;
import net.luckperms.api.model.user.User;
import net.luckperms.api.node.Node;
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
    private final String STAFF_TRACK = "staff"; // Name of your staff track in LuckPerms

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
            default:
                showHelp(sender);
                break;
        }
        return true;
    }

    private void showHelp(CommandSender sender) {
        sender.sendMessage(ColorUtils.translateColorCodes("&#c6b78f&lR&#c1b087&lA&#bca980&lN&#b7a278&lK &#b29b70&lC&#ad9469&lO&#a88d61&lM&#a38659&lM&#9e7f52&lA&#996d4a&lN&#945042&lD&#8f433b&lS"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank help &8- &7Show this help message"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank set <player> <rank> &8- &7Set a player's rank"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank promote <player> &8- &7Promote player on staff track"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/rank demote <player> &8- &7Demote player on staff track"));
    }

    private void setRank(CommandSender sender, String targetName, String rankName) {
        if (!sender.hasPermission("kernel.rank.set")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to set ranks."));
            return;
        }

        // Check if group exists
        if (luckPerms.getGroupManager().getGroup(rankName) == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Rank " + Constants.PRIMARY + rankName + " &7doesn't exist."));
            return;
        }

        // Get player UUID
        Player targetPlayer = Bukkit.getPlayer(targetName);
        UUID targetUUID;
        String finalName;

        if (targetPlayer != null) {
            targetUUID = targetPlayer.getUniqueId();
            finalName = targetPlayer.getName();
        } else {
            // Load from username if player is offline
            CompletableFuture<UUID> lookupUUID = luckPerms.getUserManager().lookupUniqueId(targetName);
            try {
                targetUUID = lookupUUID.get();
                if (targetUUID == null) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player " + Constants.PRIMARY + targetName + " &7not found."));
                    return;
                }
                finalName = targetName;
            } catch (Exception e) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Error looking up player: " + e.getMessage()));
                return;
            }
        }

        // Load the user
        luckPerms.getUserManager().loadUser(targetUUID)
            .thenAcceptAsync(user -> {
                // Clear existing groups
                user.data().clear(node -> node instanceof InheritanceNode);
                
                // Add new group
                InheritanceNode node = InheritanceNode.builder(rankName).build();
                user.data().add(node);
                
                // Save changes
                luckPerms.getUserManager().saveUser(user);

                // Send update message
                Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set " + Constants.PRIMARY + finalName + 
                        "&7's rank to " + Constants.PRIMARY + rankName + "&7."));
                    
                    // If player is online, update their tab list entry
                    if (targetPlayer != null) {
                        Bukkit.getPluginManager().callEvent(new org.bukkit.event.player.PlayerJoinEvent(
                            targetPlayer, null
                        ));
                    }
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

        luckPerms.getUserManager().loadUser(targetPlayer.getUniqueId())
        .thenAcceptAsync(user -> {
            try {
                String currentGroup = user.getPrimaryGroup();
                int currentIndex = track.getGroups().indexOf(currentGroup);
                
                // Check if already at highest rank
                if (currentIndex >= track.getGroups().size() - 1) {
                    Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + targetName + 
                            " &7is already at the highest rank " + Constants.PRIMARY + "(" + currentGroup + ")."));
                    });
                    return;
                }

                String newGroup = track.getGroups().get(currentIndex + 1);
                
                // Clear existing groups and add new one
                user.data().clear(node -> node instanceof InheritanceNode);
                user.data().add(InheritanceNode.builder(newGroup).build());
                
                // Save changes
                luckPerms.getUserManager().saveUser(user);
                
                Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Promoted " + 
                        Constants.PRIMARY + targetName + "&7 from " + Constants.PRIMARY + currentGroup + " to " + 
                        Constants.PRIMARY + newGroup + "."));
                    targetPlayer.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have been promoted to " + Constants.PRIMARY + newGroup + "."));
                    Bukkit.getPluginManager().callEvent(new org.bukkit.event.player.PlayerJoinEvent(targetPlayer, null));
                });
            } catch (Exception e) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Error during promotion: " + e.getMessage()));
            }
        });
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

        luckPerms.getUserManager().loadUser(targetPlayer.getUniqueId())
        .thenAcceptAsync(user -> {
            try {
                String currentGroup = user.getPrimaryGroup();
                int currentIndex = track.getGroups().indexOf(currentGroup);
                
                // Check if already at lowest rank
                if (currentIndex <= 0) {
                    Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + targetName + 
                            " &7is already at the lowest rank " + Constants.PRIMARY + "(" + currentGroup + ")."));
                    });
                    return;
                }

                String newGroup = track.getGroups().get(currentIndex - 1);
                
                // Clear existing groups and add new one
                user.data().clear(node -> node instanceof InheritanceNode);
                user.data().add(InheritanceNode.builder(newGroup).build());
                
                // Save changes
                luckPerms.getUserManager().saveUser(user);
                
                Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("Kernel"), () -> {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Demoted " + 
                        Constants.PRIMARY + targetName + "&7 from " + Constants.PRIMARY + currentGroup + " to " + 
                        Constants.PRIMARY + newGroup + "."));
                    targetPlayer.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have been demoted to " + Constants.PRIMARY + newGroup + "."));
                    Bukkit.getPluginManager().callEvent(new org.bukkit.event.player.PlayerJoinEvent(targetPlayer, null));
                });
            } catch (Exception e) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Error during demotion: " + e.getMessage()));
            }
        });
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            List<String> subCommands = Arrays.asList("help", "set", "promote", "demote");
            return subCommands.stream()
                    .filter(sc -> sc.toLowerCase().startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (args.length == 2) {
            // Return online players for all subcommands that need player names
            String subCommand = args[0].toLowerCase();
            if (subCommand.equals("set") || subCommand.equals("promote") || subCommand.equals("demote")) {
                return Bukkit.getOnlinePlayers().stream()
                        .map(Player::getName)
                        .filter(name -> name.toLowerCase().startsWith(args[1].toLowerCase()))
                        .collect(Collectors.toList());
            }
        }
        
        if (args.length == 3 && args[0].equalsIgnoreCase("set")) {
            // Return available groups for set subcommand
            return luckPerms.getGroupManager().getLoadedGroups().stream()
                    .map(group -> group.getName())
                    .filter(name -> name.toLowerCase().startsWith(args[2].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        return new ArrayList<>();
    }
}