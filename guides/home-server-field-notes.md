---
layout: guide
title: "Field Notes: What Actually Happened When We Built the Home Server"
description: The real build log behind our home server guide — a locked SD card, a ghost hostname, a router that wasn't what we thought, and every other gap between the instructions and the bench.
nav: home-it
section: Home IT Infrastructure
section_url: /sections/home-it.html
subhead: Chapter 1 is the guide we'd hand anyone building a home server. This is what happened when we followed it ourselves, over one evening and one morning — every snag, every surprise, and the two lines the guide gained because the bench disagreed with the page.
author: rojan.dev
published: 2026-08-28
hero: /assets/images/hestia-notes-hero.svg
hero_alt: Illustration of a spiral notepad, a mini PC and an SD card with its lock tab, arranged on a bench
hero_caption: The build in three objects — the plan, the machine, and the write-protect tab that ate the first twenty minutes.
hero_credit: "Illustration: Makers Manual"
---

## Why a build log {#the-gap}

Every guide describes the build that goes right. This chapter is the
companion record of the build that actually happened — the same steps as
[Chapter 1](home-server-vpn.html), run for real on the bench, with a
timer running and no editing out the fumbles. The server in question is
the guide's own worked example: a GMKtec G11 mini PC, christened
**hestia** (keeper of the hearth in Greek myth — a name you'll be
typing often, so pick one you like), now serving
**example.family** to the world and carrying a
VPN back to the house.

Total wall-clock time from sealed box to live website: **about three
hours of actual work**, spread over an evening and a morning. Of those,
roughly forty minutes went to things the guide couldn't have predicted.
Those forty minutes are this article.

## The flash: a locked card and 2.9 MB/s {#flash}

The plan called for a USB stick; the drawer offered a 4 GB SD card in a
Transcend USB reader. This works — a card in a USB reader boots a PC
exactly like a stick — but it delivered the build's first two lessons.

First, balenaEtcher refused the card as a target, badging it **Locked**.
No software was at fault: SD cards carry a physical write-protect slider
on their left edge, and decades of pocket travel had nudged it down.
Slide the tab toward the contacts, reinsert, badge gone. (If the card
lives in a microSD-to-SD adapter, the slider is on the adapter.) The
same screen earned its keep a second way: it listed the Mac's own
system drive with the targets grayed out — Etcher deliberately won't
let you flash your own boot disk, which is exactly the guardrail you
want in a tool used half-asleep.

Second, the flash ran at **2.9 MB/s** — seventeen minutes for a 2.9 GB
image, plus a validation pass. That's not a problem; it's what a
years-old Class 4 card does. A modern USB 3 stick does the same job in
under two minutes. For a boot medium used once, it genuinely doesn't
matter. For your patience, it might.

## Install hour: two NICs and one underfed partition {#install}

The Ubuntu Server install ran as the guide describes, with two moments
worth recording.

The network screen was the reassuring one: the G11's two Ethernet ports
showed up as `eno1` ("not connected" — the empty jack, not an error) and
`enp4s0`, which had already pulled a LAN address *and* a set of real
IPv6 addresses from the fiber line. If your network screen shows an
address, write it down; it's how you'll find the machine after reboot.

The storage screen was the trap the guide warns about, and it's real:
the default layout offered root as a **100 GB logical volume on a
512 GB drive**, with the balance parked as free space in the volume
group. The fix is one edit on the confirmation screen — select the
root volume, Edit, set size to the maximum shown. Honest postscript:
our live edit still came up short of the full disk (the first login
banner later showed ~392 GB usable). We shrugged and moved on, because
this is LVM's whole virtue — the volume can be grown *while the server
runs*, so a partial fix costs nothing but a future two-command errand.

## The GitHub key trick {#github-keys}

The single best moment of the install: the SSH screen offers **Import
SSH identity from GitHub**, and it's exactly what it sounds like.
GitHub publishes every account's public keys at
`github.com/<username>.keys`; the installer fetches yours and
pre-authorizes them. One username typed on the bench, and the very
first `ssh` from the laptop landed at a shell with no password — and
the installer had disabled SSH password authentication on its own,
completing the guide's hardening section before we got there.

The prerequisite is having a key on GitHub at all. Ours had to be made
first (`ssh-keygen -t ed25519`, then paste the *public* half into
GitHub → Settings → SSH keys). Worth internalizing once: the `.pub`
half is genuinely public — GitHub serves it to anyone who asks — and
the other half never leaves your machine. That asymmetry is the entire
trick.

## The reboot race and the ghost hostname {#reboot-race}

First post-install SSH attempt: `No route to host`. Thirty seconds of
honest panic, then the obvious explanation — the server was still
booting. By the time a diagnostic ping went out, the box was up and
answering. **Lesson: a freshly rebooted headless machine needs a
minute, and the error for "not booted yet" looks identical to the
error for "genuinely broken."** Wait before worrying.

The diagnostic detour surfaced something better, though. The network's
device table showed the server's network card at *two* addresses with
*two* names: the new hostname at the new address, and **NUCBOX_G11** —
the machine's factory Windows identity — squatting on a stale lease
from before the wipe. Routers and portals cache the hostname they
first saw and keep it long after the machine has become someone else.
The moral, which recurs below: **track machines by MAC address, not by
name.** Names are gossip; the MAC is the passport.

## The router that wasn't {#router}

The guide says "add a DHCP reservation in your router." Simple — except
the build's first attempt opened a router that local DNS swore was
OpenWrt, and the page that loaded was **Google Fiber**. (The OpenWrt
label was another ghost — a leftover DNS record from an older setup.
Machines lie about names; see above.)

Google Fiber's boxes hide the useful controls behind the account
portal, not the local status page, and the trail is: portal →
**Network → Advanced Settings → Devices** → find the machine (listed,
naturally, as NUCBOX_G11 — matched by MAC) → **Reserved IP: On** →
Save. The confirmation came with the build's best comic beat: the
lease now reads **"Expires: Wed, Dec 31, 1969"** — the Unix epoch,
which is router-speak for *never*.

Two absences on that page are the design working: **DMZ: off** and
**Port forwarding rules: none**, and both stayed that way through the
entire build. If your notes ever call for opening a port on this
project, something has drifted from the plan.

## Tailscale, and the rule the guide forgot {#vpn-live}

The VPN went in almost exactly per the guide — install script, one
`tailscale up` with the subnet-route and exit-node flags, an
authentication URL to open on the laptop, then three clicks of approval
in the admin console. Plus the one that's easy to skip and expensive to
learn later: **disable key expiry**, because the default is a silent
six-month countdown to a dead VPN, timed by Murphy to a trip abroad.

The bench's real contribution was a firewall subtlety. The hardening
section locks SSH to the home LAN — which means the moment the VPN
works, SSH arriving *through it* comes from tailnet addresses and gets
dropped by your own rule. The fix is two lines, now amended into
Chapter 1:

```
sudo ufw allow in on tailscale0
sudo ufw route allow in on tailscale0
```

The diagnostics page repaid a look, too: it showed the server
reachable for **direct** WireGuard connections (no relay), meaning
phone-to-house traffic takes the short path at full speed. And the
proof-of-life test is the one the guide prescribes: phone, Wi-Fi
**off**, cellular only — and the router's admin page rendering over
the cell network. That screen is the moment "VPN back to the house"
stops being a plan.

## A domain born on Cloudflare {#domain-tunnel}

The domain step collapsed to nothing: example.family had been
registered *at* Cloudflare, so there were no nameservers to change and
the zone was active on arrival. One panic worth pre-empting: the DNS
records page for the new domain is **empty**, and Cloudflare decorates
it with warnings that visitors can't reach the site. Empty is correct.
The tunnel writes its own records when you map hostnames to it — and
the one thing you must *not* do is "fix" the empty zone by adding an A
record with your home IP, which would publish the exact address this
architecture exists to hide.

## Ignition: one skipped command, one secret, one 200 {#launch}

Docker's install script ran clean, and then the build hit the oldest
gotcha in the container book anyway: `permission denied` on the Docker
socket, because the `usermod -aG docker` line had been skipped and —
after running it — the change only takes effect on a **fresh login**.
Exit, SSH back in, working. Every Docker tutorial warns about this;
this build got caught regardless; yours will too.

The tunnel came up on the first try: token into a `.env` file (mode
600 — that token is a credential; anyone holding it can serve content
as your domain, and the dashboard has a **Refresh token** lever if it
ever leaks), two published-application routes pointing the bare domain
and `www` at `web:80`, catch-all left at 404 so probed subdomains get
nothing. Then:

```
docker compose up -d
```

…and the verification that ends the build phase: both hostnames
answering **HTTP/2 200, server: cloudflare** from the public internet,
serving a one-paragraph page from a box whose router still forwards
nothing.

## The IP that wasn't home {#split-tunnel}

The victory lap produced the build's best teachable moment. Laptop on
the phone's hotspot, Tailscale connected, a what's-my-IP site open —
and the address shown was the *phone carrier's*, geolocated to a
gateway city hundreds of miles from anyone involved.

Nothing was broken. **Tailscale is a split tunnel by default**: only
traffic for the tailnet and the home subnet rides the VPN; everything
else exits by the local network. The full "browse as if at home" mode
is the **exit node**, enabled per-device from the client's menu — and
with it on, the same site dutifully reported the home address. The
pattern that stuck: exit node *off* at home (where it's a pointless
loop), *on* for hotels, airports and any network you don't own — where
it means every site sees your house, and the local network sees only
WireGuard noise.

## The punch list {#punch-list}

What a real build leaves behind isn't a finished system; it's a short,
honest list of deferred work. Ours, recorded here so it can't be
forgotten:

- **Grow the root volume** to the disk's full size (`lvextend` +
  `resize2fs`, doable live).
- **The UDP GRO tweak** Tailscale suggested for faster forwarded
  traffic — a one-line `ethtool` change that needs a persistence hook.
- **Off-site backups** — restic to an object store, once the site holds
  more than a paragraph.
- **The travel test ritual** — before any trip: site loads on
  cellular, SSH over the VPN answers, exit node flips on and shows the
  home address.

Three hours, six screenshots of things the guide didn't predict, and a
website served from the bench. The gap between a guide and a build is
never zero — but it turns out to be about forty minutes wide, and every
minute of it taught something the clean version couldn't.

---

**Elsewhere in this section:** the guide this log road-tested is
[Chapter 1: The Home Server, Explained](home-server-vpn.html) — now
carrying the firewall amendment this build earned.

## References {#references}

1. Makers Manual, [The Home Server, Explained](home-server-vpn.html) — the guide this build followed, amended August 28 with the tailnet firewall rules from § 7 above.
2. Tailscale, [exit nodes](https://tailscale.com/kb/1103/exit-nodes) and [subnet routers](https://tailscale.com/kb/1019/subnets) — the split-tunnel behavior in § 9, from the source.
3. Cloudflare, [Tunnel documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — token handling and published application routes.
4. GitHub, [public key endpoint](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) — the `.keys` URL behind the installer's import trick.
5. Ubuntu, [Server documentation](https://documentation.ubuntu.com/server/) — the installer flow, including the storage screen where the § 3 edit happens.
{: .references}

*Recorded August 27–28, 2026. Addresses shown to the reader are
placeholders or private ranges throughout; as Chapter 1 advises, treat
your public IP as private information even though machines can discover
it.*
