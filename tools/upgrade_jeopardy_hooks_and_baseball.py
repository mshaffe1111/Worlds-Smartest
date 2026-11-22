#!/usr/bin/env python3
"""
World's Smartest — Upgrade #3: Jeopardy-Style Narrative Hooks Across ALL 12 Domains
& ALL 157 Subcategories + 275 Hand-Crafted Baseball "Signature Diamond Classics"
===================================================================================

Deterministic generator & exhaustive verifier for:
  - public/data/shards/subcat_baseball.json
      * 275 bespoke hand-crafted Jeopardy/sportswriter rows (`sub_bb_signature_lore`)
        spanning 4 balanced themes (`IMMORTALS`, `OCTOBER_DRAMA`, `RECORDS_FEATS`,
        `DIAMOND_CULTURE`) with ballot/era-accurate inline distractors.
      * Era-bucketed pooling & `preferSameCol` across all 7 Lahman MLB tables so
        2010s-2020s stars face modern contemporaries & clubs instead of 1880s players.
      * Fixes Lahman AL/NL swap on 2024 Pitching Triple Crowns (Chris Sale = NL,
        Tarik Skubal = AL) and formats honors/Cooperstown inductions gracefully.
      * Preserves exact 34,033 QID span [1,100,000 .. 1,134,032] (0 collision with
        domain_subcats_0.json at 1,134,033; 34,283 verified Baseball Qs).
  - public/data/shards/taxonomy_tree.json
      * Upgrades all 7 `sub_bb_*` angle prompts to crisp sportswriting & registers
        `sub_bb_signature_lore` with 4 themed weighted rules under Baseball.
      * Authors `stemVariants` (5 distinct broadcast phrasings) on EVERY prompt angle
        and paired `truePromptVariants`/`falsePromptVariants` (4 each) on EVERY
        GAUNTLET_SHATTER angle across ALL 33 specialist table types (126 angles).
  - public/data/shards/shard_manifest.json
      * Authors `stemVariants` (5 distinct broadcast phrasings) on EVERY prompt angle
        and paired `truePromptVariants`/`falsePromptVariants` (4 each) on EVERY
        GAUNTLET_SHATTER angle across ALL 45 main-shard table types (189 angles,
        all 12 domains = 929,564 Qs).

Usage:
    python tools/upgrade_jeopardy_hooks_and_baseball.py          # apply + verify
    python tools/upgrade_jeopardy_hooks_and_baseball.py --verify # read-only audit
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Set, Tuple

ROOT = Path(__file__).resolve().parent.parent
SHARDS_DIR = ROOT / "public" / "data" / "shards"
BASEBALL_SHARD_PATH = SHARDS_DIR / "subcat_baseball.json"
TAXONOMY_PATH = SHARDS_DIR / "taxonomy_tree.json"
MANIFEST_PATH = SHARDS_DIR / "shard_manifest.json"
CACHE_DIR = Path(tempfile.gettempdir()) / "ws_million_shard_cache_v1"

ALLOWED_EXTRA_CHARS = set(
    "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß"
    "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"
    "ĀāĂăĄąĆćČčĎďĐđĒēĖėĘęĚěĞğĪīİıŁłŃńŇňŌōŐőŒœŔŕŘřŚśŞşŠšŢţŤťŪūŮůŰűŹźŻżŽž"
    "°²³·"
)

# =============================================================================
# 1. 275 BESPOKE HAND-CRAFTED "SIGNATURE DIAMOND CLASSICS" (`sub_bb_signature_lore`)
# Schema per tuple:
#   (slug, theme, prompt, answer, d1, d2, d3, clue1, clue2, why, irt_x100)
# Themes: IMMORTALS (70), OCTOBER_DRAMA (69), RECORDS_FEATS (68), DIAMOND_CULTURE (68)
# =============================================================================

SIGNATURE_DIAMOND_CLASSICS: List[Tuple[str, str, str, str, str, str, str, str, str, str, int]] = [
    # -------------------------------------------------------------------------
    # THEME 1: IMMORTALS (70 bespoke entries)
    # -------------------------------------------------------------------------
    (
        "ruth_1927_60_hr",
        "IMMORTALS",
        "In 1927, this Murderers' Row slugger belted 60 home runs - more than every other American League team hit all season.",
        "Babe Ruth",
        "Lou Gehrig",
        "Jimmie Foxx",
        "Rogers Hornsby",
        "Sold by the Red Sox to New York before the 1920 season, he remade baseball into a power game.",
        "Known as the Sultan of Swat, he wore number 3 for the Yankees.",
        "Babe Ruth hit 60 home runs in 1927, out-homering every other AL club and setting a record that stood for 34 years.",
        -135,
    ),
    (
        "ruth_pitching_streak",
        "IMMORTALS",
        "Before revolutionizing offense in the Bronx, this left-hander pitched 29.2 consecutive scoreless World Series innings for Boston.",
        "Babe Ruth",
        "Smoky Joe Wood",
        "Lefty Grove",
        "Carl Hubbell",
        "He went 94-46 on the mound with a 2.28 career ERA before switching full-time to the outfield.",
        "His 1916-1918 Fall Classic scoreless streak lasted until Whitey Ford broke it in 1961.",
        "As a Boston Red Sox pitcher, Babe Ruth won 23 games in 1916 and 24 in 1917 while spinning 29.2 straight scoreless World Series frames.",
        -35,
    ),
    (
        "jackie_robinson_1947",
        "IMMORTALS",
        "Stepping onto Ebbets Field on April 15, 1947, this Brooklyn infielder broke Major League Baseball's modern color barrier.",
        "Jackie Robinson",
        "Larry Doby",
        "Roy Campanella",
        "Don Newcombe",
        "Signed by Branch Rickey after starring in Montreal, he won MLB's inaugural Rookie of the Year Award.",
        "His uniform number 42 is retired across all 30 Major League Baseball clubs.",
        "Jackie Robinson debuted for the Brooklyn Dodgers on April 15, 1947, earning 1947 Rookie of the Year and 1949 NL MVP honors.",
        -135,
    ),
    (
        "larry_doby_al_1947",
        "IMMORTALS",
        "Less than three months after Ebbets Field's historic debut, this Newark Eagles star integrated the American League in Cleveland.",
        "Larry Doby",
        "Satchel Paige",
        "Monte Irvin",
        "Minnie Minoso",
        "He debuted for Cleveland on July 5, 1947, and helped win the 1948 World Series.",
        "The seven-time All-Star center fielder twice led the AL in home runs.",
        "Larry Doby broke the American League color line with the Cleveland Indians on July 5, 1947, and later led the AL in homers in 1952 and 1954.",
        -25,
    ),
    (
        "clemente_3000th_hit",
        "IMMORTALS",
        "This 12-time Gold Glove Pirates right fielder doubled in his final regular-season at-bat in September 1972 for hit number 3,000.",
        "Roberto Clemente",
        "Willie Stargell",
        "Al Kaline",
        "Frank Robinson",
        "Born in Carolina, Puerto Rico, he batted .414 to capture 1971 World Series MVP honors.",
        "He died on New Year's Eve 1972 delivering earthquake relief supplies to Nicaragua.",
        "Roberto Clemente recorded his 3,000th hit off Jon Matlack on September 30, 1972, becoming the first Latin American Hall of Famer.",
        -115,
    ),
    (
        "mays_say_hey_kid",
        "IMMORTALS",
        "Nicknamed the Say Hey Kid, this 24-time All-Star center fielder combined 660 home runs with 12 Gold Gloves for the Giants.",
        "Willie Mays",
        "Duke Snider",
        "Mickey Mantle",
        "Hank Aaron",
        "He began his pro career with the Birmingham Black Barons before joining the New York Giants.",
        "His over-the-shoulder grab in the 1954 World Series became known simply as The Catch.",
        "Willie Mays won two NL MVPs, 12 Gold Gloves, and hit 660 homers across 22 seasons, retiring as baseball's quintessential five-tool icon.",
        -130,
    ),
    (
        "aaron_715_consistency",
        "IMMORTALS",
        "Never once hitting 50 home runs in a single season, this Braves slugger still passed Babe Ruth with homer 715 in April 1974.",
        "Hank Aaron",
        "Eddie Mathews",
        "Willie McCovey",
        "Harmon Killebrew",
        "His 2,297 career RBIs and 6,856 total bases remain unchallenged MLB records.",
        "Nicknamed Hammerin' Hank, he connected off Dodgers lefty Al Downing in Atlanta.",
        "Hank Aaron finished with 755 homers despite a single-season high of 47, exemplifying unmatched durability across 23 seasons.",
        -125,
    ),
    (
        "koufax_yom_kippur_1965",
        "IMMORTALS",
        "Refusing to pitch Game 1 of the 1965 World Series on Yom Kippur, this Dodgers lefty still won Game 7 on two days' rest.",
        "Sandy Koufax",
        "Don Drysdale",
        "Whitey Ford",
        "Warren Spahn",
        "He threw four no-hitters in four seasons, culminating in a 1965 perfect game against the Cubs.",
        "Severe elbow arthritis forced him to retire at age 30 right after a 27-win Cy Young season.",
        "Sandy Koufax sat out Game 1 of the 1965 Fall Classic to observe Yom Kippur, then threw shutouts in Games 5 and 7 to win Series MVP.",
        -115,
    ),
    (
        "gibson_1968_mound",
        "IMMORTALS",
        "After this Cardinals ace posted a microscopic 1.12 ERA with 13 shutouts in 1968, MLB lowered the pitcher's mound by five inches.",
        "Bob Gibson",
        "Denny McLain",
        "Juan Marichal",
        "Tom Seaver",
        "He fanned a World Series record 17 Detroit Tigers in Game 1 of the 1968 Fall Classic.",
        "He won both the NL Cy Young and NL MVP Awards in that historic 1968 campaign.",
        "Bob Gibson's 1.12 ERA in 1968 remains the modern live-ball record and prompted MLB to lower the mound from 15 to 10 inches for 1969.",
        -110,
    ),
    (
        "ted_williams_406_1941",
        "IMMORTALS",
        "Sitting at .39955 entering the final-day doubleheader of 1941, this Red Sox legend refused to sit and went 6-for-8 to finish at .406.",
        "Ted Williams",
        "Joe DiMaggio",
        "Stan Musial",
        "Lou Boudreau",
        "He lost nearly five prime seasons serving as a Marine fighter pilot in World War II and Korea.",
        "Known as the Splendid Splinter, he holds MLB's all-time career OBP record of .482.",
        "Ted Williams declined manager Joe Cronin's offer to sit out the 1941 finale, rapping six hits in Philadelphia to remain MLB's last .400 hitter.",
        -120,
    ),
    (
        "gehrig_luckiest_man",
        "IMMORTALS",
        "After playing 2,130 consecutive games, this Yankees first baseman delivered his 'luckiest man on the face of the earth' speech in 1939.",
        "Lou Gehrig",
        "Bill Dickey",
        "Tony Lazzeri",
        "Jimmie Foxx",
        "His uniform number 4 was the first ever retired by a Major League Baseball franchise.",
        "Nicknamed the Iron Horse, he won the 1934 AL Triple Crown and hit 23 career grand slams.",
        "Lou Gehrig ended his 2,130-game streak in May 1939 after being diagnosed with ALS and gave his immortal farewell at Yankee Stadium on July 4.",
        -135,
    ),
    (
        "dimaggio_56_streak",
        "IMMORTALS",
        "During the summer of 1941, this graceful Yankees center fielder hit safely in 56 consecutive games, a mark untouched for over 80 years.",
        "Joe DiMaggio",
        "Ted Williams",
        "Charlie Gehringer",
        "Johnny Mize",
        "Remarkably, he hit 361 career home runs while striking out only 369 times.",
        "Known as the Yankee Clipper, he won nine World Series rings in 13 MLB seasons.",
        "Joe DiMaggio's 56-game hitting streak from May 15 to July 16, 1941, saw him bat .408 with 15 homers before Cleveland ended the run.",
        -130,
    ),
    (
        "mantle_ws_hr_king",
        "IMMORTALS",
        "Playing through chronic knee injuries, this switch-hitting Yankees icon crushed an all-time record 18 World Series home runs.",
        "Mickey Mantle",
        "Yogi Berra",
        "Reggie Jackson",
        "Duke Snider",
        "He captured the 1956 AL Triple Crown by batting .353 with 52 home runs and 130 RBIs.",
        "Known as the Commerce Comet, he wore number 7 in Monument Park.",
        "Mickey Mantle's 18 Fall Classic homers, 40 RBIs, and 42 runs scored remain the gold standard of October power.",
        -115,
    ),
    (
        "yogi_berra_10_rings",
        "IMMORTALS",
        "Famed as much for his witty malapropisms as his bad-ball hitting, this Yankees catcher won an unmatched 10 World Series titles as a player.",
        "Yogi Berra",
        "Roy Campanella",
        "Bill Dickey",
        "Elston Howard",
        "He won three AL MVP Awards and caught Don Larsen's 1956 World Series perfect game.",
        "His famous lines include 'It ain't over till it's over' and 'Deja vu all over again.'",
        "Yogi Berra appeared in 14 World Series and captured 10 championship rings as a Yankees player, plus three more as a coach.",
        -125,
    ),
    (
        "stan_musial_symmetric_hits",
        "IMMORTALS",
        "Nicknamed 'The Man', this Cardinals legend retired with 3,630 career hits split symmetrically: 1,815 at home and 1,815 on the road.",
        "Stan Musial",
        "Enos Slaughter",
        "Red Schoendienst",
        "Lou Brock",
        "He played all 22 MLB seasons in St. Louis and won seven NL batting titles.",
        "He won three NL MVP Awards and earned 24 All-Star selections.",
        "Stan Musial's exact 1,815 home / 1,815 road split is one of baseball's most uncanny statistical symmetries.",
        -90,
    ),
    (
        "mariano_rivera_unanimous",
        "IMMORTALS",
        "Riding one devastating cut fastball and 'Enter Sandman', this Yankees closer became Cooperstown's first unanimous electee in 2019.",
        "Mariano Rivera",
        "Trevor Hoffman",
        "Dennis Eckersley",
        "Billy Wagner",
        "He compiled MLB's all-time record 652 regular-season saves and a 0.70 postseason ERA.",
        "He was the last MLB player permitted to wear Jackie Robinson's retired number 42.",
        "Mariano Rivera received all 425 BBWAA votes (100%) in 2019 after anchoring five Yankees World Series championships.",
        -125,
    ),
    (
        "derek_jeter_mr_november",
        "IMMORTALS",
        "Called 'Mr. November' after his 2001 midnight walk-off homer, this Yankees captain finished with 3,465 hits and 99.7% on his Hall ballot.",
        "Derek Jeter",
        "Nomar Garciaparra",
        "Alex Rodriguez",
        "Chipper Jones",
        "His backhand shovel relay against Oakland in the 2001 ALDS is remembered as The Flip.",
        "He fell just one vote short of joining teammate Mariano Rivera as a unanimous Hall of Famer.",
        "Derek Jeter won five World Series rings and 2000 Series MVP while setting the Yankees franchise record with 3,465 career hits.",
        -120,
    ),
    (
        "ichiro_262_hits",
        "IMMORTALS",
        "After winning both AL MVP and Rookie of the Year in 2001, this Mariners outfielder shattered George Sisler's record with 262 hits in 2004.",
        "Ichiro Suzuki",
        "Hideki Matsui",
        "Derek Jeter",
        "Vladimir Guerrero",
        "He logged 10 consecutive 200-hit seasons to open his MLB career after arriving from Japan.",
        "His laser right-field throws and slap-hitting mastery earned him 10 straight Gold Gloves.",
        "Ichiro Suzuki amassed 3,089 MLB hits (plus 1,278 in NPB) and set the single-season record of 262 hits in 2004.",
        -125,
    ),
    (
        "ohtani_50_50_2024",
        "IMMORTALS",
        "In 2024, this Dodgers two-way phenomenon founded MLB's 50-50 club with 54 home runs and 59 steals while winning his third unanimous MVP.",
        "Shohei Ohtani",
        "Ronald Acuna Jr.",
        "Aaron Judge",
        "Mookie Betts",
        "He sealed the milestone in Miami with a 6-for-6, three-homer, 10-RBI masterpiece on September 19.",
        "A year earlier, he struck out Angels teammate Mike Trout to clinch the 2023 World Baseball Classic.",
        "Shohei Ohtani became the first 50-50 player in MLB history in 2024 and captured his first World Series title with Los Angeles.",
        -135,
    ),
    (
        "cal_ripken_2632",
        "IMMORTALS",
        "On September 6, 1995, this Orioles shortstop jogged around Camden Yards after playing his 2,131st straight game, ending his streak at 2,632.",
        "Cal Ripken Jr.",
        "Robin Yount",
        "Alan Trammell",
        "Barry Larkin",
        "At 6-foot-4, he shattered the mold of light-hitting shortstops by winning two AL MVP Awards.",
        "He played 8,264 consecutive innings between 1982 and 1987.",
        "Cal Ripken Jr. surpassed Lou Gehrig's 56-year consecutive-games record in 1995 and played 2,632 straight games before sitting in 1998.",
        -125,
    ),
    (
        "satchel_paige_oldest_rookie",
        "IMMORTALS",
        "After dazzling Negro Leagues crowds for two decades with his hesitation pitch, this right-hander debuted in MLB at age 42 in 1948.",
        "Satchel Paige",
        "Smokey Joe Williams",
        "Bullet Rogan",
        "Hilton Smith",
        "He went 6-1 down the stretch to help the 1948 Cleveland Indians win the World Series.",
        "In 1965 at age 59, he threw three scoreless innings for the Kansas City Athletics.",
        "Leroy 'Satchel' Paige became MLB's oldest rookie in 1948 and the first player inducted via the Negro Leagues Committee in 1971.",
        -105,
    ),
    (
        "josh_gibson_negro_leagues",
        "IMMORTALS",
        "Revered as the power-hitting catcher of the Homestead Grays and Pittsburgh Crawfords, this legend holds MLB's highest career average at .372.",
        "Josh Gibson",
        "Buck Leonard",
        "Oscar Charleston",
        "Turkey Stearnes",
        "Contemporaries marveled at his tape-measure blasts out of Yankee Stadium and Griffith Stadium.",
        "MLB formally incorporated Negro Leagues statistics into its official record books in 2024.",
        "Josh Gibson dominated the Negro Leagues with historic power and batting average, earning Cooperstown enshrinement in 1972.",
        -95,
    ),
    (
        "buck_oneil_ambassador",
        "IMMORTALS",
        "A star first baseman and manager for the Kansas City Monarchs, this beloved ambassador became MLB's first Black coach with the 1962 Cubs.",
        "Buck O'Neil",
        "Rube Foster",
        "Cool Papa Bell",
        "Monte Irvin",
        "He helped found the Negro Leagues Baseball Museum in Kansas City and charmed Ken Burns's 'Baseball' viewers.",
        "He was posthumously elected to the National Baseball Hall of Fame in the Class of 2022.",
        "John 'Buck' O'Neil scouted Ernie Banks and Lou Brock for the Cubs and spent his life preserving Negro Leagues history.",
        -55,
    ),
    (
        "cool_papa_bell_speed",
        "IMMORTALS",
        "Satchel Paige famously joked that this Negro Leagues speedster was so fast he could flick off the light switch and be in bed before dark.",
        "Cool Papa Bell",
        "Oscar Charleston",
        "Judy Johnson",
        "Martin Dihigo",
        "He starred in center field for the St. Louis Stars, Pittsburgh Crawfords, and Homestead Grays.",
        "He reportedly once scored from first base on a sacrifice bunt in an exhibition against MLB All-Stars.",
        "James 'Cool Papa' Bell was elected to Cooperstown in 1974 as perhaps the fastest baserunner ever to play the game.",
        -75,
    ),
    (
        "rube_foster_nnl_founder",
        "IMMORTALS",
        "In February 1920 at Kansas City's Paseo YMCA, this ace pitcher and Chicago American Giants owner founded the Negro National League.",
        "Rube Foster",
        "Effa Manley",
        "Gus Greenlee",
        "Cumberland Posey",
        "Known as the Father of Black Baseball, he pioneered bunt-and-run 'scientific baseball'.",
        "He was elected to the National Baseball Hall of Fame in 1981.",
        "Andrew 'Rube' Foster organized the first enduring African American major league in 1920, transforming Black professional baseball.",
        -20,
    ),
    (
        "oscar_charleston_five_tool",
        "IMMORTALS",
        "Historian Bill James ranked this ferocious Pittsburgh Crawfords center fielder and manager among the top five players in baseball history.",
        "Oscar Charleston",
        "Cristobal Torriente",
        "Pop Lloyd",
        "Biz Mackey",
        "He led the Indianapolis ABCs and Crawfords while combining Ruthian power with blistering speed.",
        "His 1935 Crawfords featured five future Hall of Famers including Josh Gibson and Satchel Paige.",
        "Oscar Charleston batted .363 across verified Negro Leagues play and was inducted into Cooperstown in 1976.",
        35,
    ),
    (
        "frank_robinson_both_mvps",
        "IMMORTALS",
        "The only player to win MVP in both the National and American Leagues, he also broke ground in 1975 as MLB's first Black manager.",
        "Frank Robinson",
        "Joe Morgan",
        "Hank Aaron",
        "Willie Stargell",
        "He captured the 1961 NL MVP in Cincinnati and the 1966 AL Triple Crown and MVP in Baltimore.",
        "He homered in his very first at-bat as Cleveland's player-manager on Opening Day 1975.",
        "Frank Robinson belted 586 homers, won MVPs in both leagues, and managed Cleveland, San Francisco, Baltimore, and Montreal/Washington.",
        -100,
    ),
    (
        "ernie_banks_mr_cub",
        "IMMORTALS",
        "Beloved for greeting sunny Wrigley mornings with 'Let's play two!', this shortstop won back-to-back NL MVPs in 1958 and 1959 on losing clubs.",
        "Ernie Banks",
        "Billy Williams",
        "Ron Santo",
        "Ryne Sandberg",
        "Signed from the Kansas City Monarchs, he launched 512 career home runs all in Chicago.",
        "Affectionately nicknamed Mr. Cub, he wore number 14 for 19 seasons.",
        "Ernie Banks was the first player to win consecutive NL MVPs on sub-.500 teams and became Wrigley Field's eternal goodwill icon.",
        -115,
    ),
    (
        "tony_gwynn_mr_padre",
        "IMMORTALS",
        "Obsessed with videotape study, this eight-time NL batting champion struck out just 434 times across 20 seasons and hit .394 in 1994.",
        "Tony Gwynn",
        "Wade Boggs",
        "Rod Carew",
        "Kirby Puckett",
        "He spent his entire Hall of Fame career with San Diego, collecting 3,141 hits.",
        "Against four-time Cy Young winner Greg Maddux, he batted .415 with zero strikeouts.",
        "Tony Gwynn's eight NL batting crowns tied Honus Wagner's league mark, and he never finished a season below .309 after his rookie year.",
        -110,
    ),
    (
        "rickey_henderson_1406_sb",
        "IMMORTALS",
        "Proclaiming 'I am the greatest of all time' upon breaking Lou Brock's record in 1991, this leadoff terror stole 1,406 career bases.",
        "Rickey Henderson",
        "Tim Raines",
        "Vince Coleman",
        "Kenny Lofton",
        "He swiped a modern-record 130 bases in 1982 and also leads MLB history with 2,295 runs scored.",
        "He launched 81 leadoff home runs and won the 1990 AL MVP with Oakland.",
        "Rickey Henderson's 1,406 steals outdistance second-place Lou Brock by 468, making his base-stealing record one of sports' safest marks.",
        -120,
    ),
    (
        "nolan_ryan_5714_so",
        "IMMORTALS",
        "Throwing 100-mph heat across 27 seasons, this Texas flamethrower piled up 5,714 strikeouts and an unmatched seven career no-hitters.",
        "Nolan Ryan",
        "Randy Johnson",
        "Steve Carlton",
        "Tom Seaver",
        "His 7th no-hitter came at age 44 in May 1991 against the Toronto Blue Jays.",
        "Despite his record dominance, he never once won a Cy Young Award.",
        "Nolan Ryan's 5,714 strikeouts stand 839 ahead of Randy Johnson, and he also threw his seventh no-hitter in his 25th MLB season.",
        -125,
    ),
    (
        "pedro_martinez_2000_era",
        "IMMORTALS",
        "At the peak of baseball's offensive explosion in 2000, this Red Sox ace posted a 1.74 ERA while the rest of the AL averaged 4.91.",
        "Pedro Martinez",
        "Roger Clemens",
        "Randy Johnson",
        "Greg Maddux",
        "A year earlier he struck out five of the first six NL batters at Fenway's 1999 All-Star Game.",
        "His 291 ERA+ in 2000 is the highest modern single-season adjusted ERA in MLB history.",
        "Pedro Martinez won three Cy Young Awards (1997, 1999, 2000) and helped Boston break its 86-year title drought in 2004.",
        -105,
    ),
    (
        "greg_maddux_professor",
        "IMMORTALS",
        "Nicknamed 'The Professor' for his surgical command, this Braves right-hander won four straight Cy Young Awards from 1992 to 1995.",
        "Greg Maddux",
        "Tom Glavine",
        "John Smoltz",
        "Mike Mussina",
        "He won a record 18 Gold Gloves as a pitcher and tallied 355 career wins.",
        "A complete-game shutout thrown on fewer than 100 pitches is now colloquially named after him.",
        "Greg Maddux mastered pinpoint two-seam movement, capturing four consecutive Cy Youngs and 18 Gold Gloves on his way to 355 wins.",
        -110,
    ),
    (
        "randy_johnson_big_unit",
        "IMMORTALS",
        "Towering at 6-foot-10 with a terrifying slider, this lefty won four straight NL Cy Young Awards in Arizona and co-won 2001 Series MVP.",
        "Randy Johnson",
        "Curt Schilling",
        "Pedro Martinez",
        "John Smoltz",
        "He finished with 4,875 strikeouts - the most ever by a left-handed pitcher.",
        "At age 40 in May 2004, he became the oldest pitcher in MLB history to throw a perfect game.",
        "Randy Johnson ('The Big Unit') won five Cy Young Awards overall and pitched both Game 6 and Game 7 relief to clinch the 2001 World Series.",
        -110,
    ),
    (
        "ken_griffey_jr_back_to_back",
        "IMMORTALS",
        "Famous for his sweet left-handed swing and backwards cap, this Mariners icon hit back-to-back homers with his own father in September 1990.",
        "Ken Griffey Jr.",
        "Barry Bonds",
        "Frank Thomas",
        "Sammy Sosa",
        "Selected first overall in 1987, he belted 630 career homers and won 10 straight Gold Gloves.",
        "In 2016 he broke Tom Seaver's ballot mark by drawing 99.3% of Hall of Fame votes.",
        "Ken Griffey Jr. ('The Kid') teamed with Ken Griffey Sr. for Seattle's unforgettable father-son back-to-back homers on September 14, 1990.",
        -120,
    ),
    (
        "albert_pujols_703_hr",
        "IMMORTALS",
        "Drafted in the 13th round in 1999, this Cardinals slugger opened with 10 straight .300/30-HR/100-RBI seasons and finished with 703 homers.",
        "Albert Pujols",
        "Miguel Cabrera",
        "David Ortiz",
        "Alex Rodriguez",
        "He joined Babe Ruth and Reggie Jackson as the only hitters with three homers in a World Series game (2011 Game 3).",
        "Nicknamed The Machine, he won three NL MVPs and two World Series rings in St. Louis.",
        "Albert Pujols returned to St. Louis in 2022 to become just the fourth player in MLB history to surpass 700 career home runs.",
        -110,
    ),
    (
        "miguel_cabrera_2012_tc",
        "IMMORTALS",
        "Batting .330 with 44 homers and 139 RBIs for Detroit in 2012, this Venezuelan star won MLB's first Batting Triple Crown in 45 years.",
        "Miguel Cabrera",
        "Albert Pujols",
        "Mike Trout",
        "Robinson Cano",
        "He debuted at age 20 with a clutch World Series homer off Roger Clemens for the 2003 Marlins.",
        "He retired as one of only seven players with both 500 home runs and 3,000 career hits.",
        "Miguel Cabrera's 2012 AL Triple Crown ended a drought dating back to Carl Yastrzemski in 1967 and earned him back-to-back AL MVPs.",
        -105,
    ),
    (
        "mike_trout_millville",
        "IMMORTALS",
        "Hailing from Millville, New Jersey, this Angels center fielder won three AL MVPs and finished top two in voting seven times in eight years.",
        "Mike Trout",
        "Mookie Betts",
        "Bryce Harper",
        "Aaron Judge",
        "He captured unanimous AL Rookie of the Year honors in 2012 after posting a 30-HR, 49-SB season.",
        "He won his three MVP trophies in 2014, 2016, and 2019.",
        "Mike Trout combined elite speed, power, and plate discipline into one of the greatest decade peaks in baseball history.",
        -115,
    ),
    (
        "aaron_judge_62_hr",
        "IMMORTALS",
        "Standing 6-foot-7 in right field, this Yankees captain crushed 62 home runs in 2022 to surpass Roger Maris's 61-year-old AL record.",
        "Aaron Judge",
        "Giancarlo Stanton",
        "Shohei Ohtani",
        "Pete Alonso",
        "He belted record homer number 62 on October 4, 2022, in Arlington against the Rangers.",
        "He followed his 2022 MVP with a unanimous 58-homer AL MVP season in 2024.",
        "Aaron Judge eclipsed Roger Maris's 1961 AL single-season home run mark in 2022 and earned the Yankees captaincy that winter.",
        -125,
    ),
    (
        "cy_young_511_wins",
        "IMMORTALS",
        "Amassing 511 wins and 749 complete games across 22 seasons, this ironman pitcher inspired MLB's annual pitching trophy created in 1956.",
        "Cy Young",
        "Walter Johnson",
        "Christy Mathewson",
        "Grover Cleveland Alexander",
        "He threw the first modern perfect game in 1904 and pitched in the inaugural 1903 World Series.",
        "He also holds the all-time record for career losses with 315.",
        "Denton True 'Cy' Young won 511 games - 94 more than second-place Walter Johnson - before baseball named its premier pitching award for him.",
        -125,
    ),
    (
        "walter_johnson_110_shutouts",
        "IMMORTALS",
        "Nicknamed 'The Big Train' for his sidearm fastball, this lifelong Washington Senator spun an unbreakable 110 career shutouts and 417 wins.",
        "Walter Johnson",
        "Christy Mathewson",
        "Lefty Grove",
        "Eddie Plank",
        "He finally captured his lone World Series title in 1924 by pitching four scoreless relief innings in Game 7.",
        "He was one of the five original Cooperstown immortals elected in 1936.",
        "Walter Johnson threw 110 shutouts and struck out 3,509 batters - a record that stood for 56 years until Nolan Ryan broke it in 1983.",
        -85,
    ),
    (
        "christy_mathewson_1905",
        "IMMORTALS",
        "Known as 'Big Six', this gentlemanly New York Giants ace threw three complete-game shutouts in six days to win the 1905 World Series.",
        "Christy Mathewson",
        "Mordecai Brown",
        "Rube Waddell",
        "Chief Bender",
        "His signature 'fadeaway' pitch was an early version of the screwball.",
        "He tied Grover Cleveland Alexander for the National League record with 373 career wins.",
        "Christy Mathewson blanked Connie Mack's Athletics three times in the 1905 Fall Classic without allowing an earned run.",
        -45,
    ),
    (
        "ty_cobb_366_avg",
        "IMMORTALS",
        "Driven by fiery intensity, this Tigers outfielder known as 'The Georgia Peach' won 12 AL batting titles and holds a .366 career average.",
        "Ty Cobb",
        "Tris Speaker",
        "Nap Lajoie",
        "Eddie Collins",
        "He collected 4,189 career hits and topped the inaugural 1936 Hall of Fame ballot with 98.2%.",
        "He won nine consecutive AL batting crowns from 1907 through 1915.",
        "Ty Cobb's .366 lifetime batting average remains the highest among players who spent their entire careers in the AL/NL.",
        -115,
    ),
    (
        "honus_wagner_t206",
        "IMMORTALS",
        "Famous both for eight NL batting titles with Pittsburgh and the multimillion-dollar T206 card he demanded pulled from cigarette packs, who was he?",
        "Honus Wagner",
        "Nap Lajoie",
        "Eddie Collins",
        "Sam Crawford",
        "Nicknamed 'The Flying Dutchman', he anchored shortstop for the 1909 World Series champions.",
        "He joined Ruth, Cobb, Mathewson, and Walter Johnson in Cooperstown's first class of 1936.",
        "Honus Wagner forced the American Tobacco Company to halt his T206 card in 1909, creating the most famous collectible in sports history.",
        -95,
    ),
    (
        "tris_speaker_792_doubles",
        "IMMORTALS",
        "Playing center field so shallow he routinely threw runners out at first base, 'The Grey Eagle' still holds MLB's record with 792 career doubles.",
        "Tris Speaker",
        "Ty Cobb",
        "Paul Waner",
        "Harry Heilmann",
        "He won two World Series with Boston and managed Cleveland to its 1920 championship.",
        "He finished his career with 3,514 hits and a .345 lifetime batting average.",
        "Tris Speaker's 792 doubles have stood untouched since 1928, and his 449 outfield assists remain an all-time record.",
        -35,
    ),
    (
        "rogers_hornsby_424",
        "IMMORTALS",
        "Hitting .424 for the Cardinals in 1924 - the highest single-season average since 1900 - this second baseman won two NL Triple Crowns.",
        "Rogers Hornsby",
        "George Sisler",
        "Bill Terry",
        "Frankie Frisch",
        "Over a five-year span from 1921 to 1925, he averaged an astonishing .402 at the plate.",
        "As player-manager in 1926, he guided St. Louis to its first World Series crown.",
        "Rogers Hornsby's .424 average in 1924 and .358 career average make him the greatest right-handed hitter for average in MLB history.",
        -55,
    ),
    (
        "jimmie_foxx_double_x",
        "IMMORTALS",
        "Nicknamed 'Double X', this muscular Athletics and Red Sox slugger became the second player in MLB history to reach 500 career home runs.",
        "Jimmie Foxx",
        "Hank Greenberg",
        "Lou Gehrig",
        "Mel Ott",
        "He blasted 58 homers in 1932 and captured the 1933 AL Triple Crown.",
        "He won three AL MVP Awards before retiring with 534 career home runs.",
        "Jimmie Foxx reached 500 homers at age 32 in 1940, holding the youngest-to-500 mark until Alex Rodriguez surpassed it in 2007.",
        -25,
    ),
    (
        "mel_ott_leg_kick",
        "IMMORTALS",
        "Using an unmistakable high front leg kick, this Polo Grounds favorite became the first National League player to hit 500 home runs.",
        "Mel Ott",
        "Chuck Klein",
        "Johnny Mize",
        "Bill Terry",
        "Signed as a 16-year-old by John McGraw, he played all 22 seasons for the New York Giants.",
        "He belted 323 of his 511 career homers inside the Polo Grounds' cozy 258-foot right field.",
        "Mel Ott reached 500 homers in 1945 and served as Giants player-manager when Leo Durocher famously quipped 'Nice guys finish last.'",
        -15,
    ),
    (
        "johnny_bench_big_red",
        "IMMORTALS",
        "Revolutionizing catching with a hinged mitt and one-handed receiving, this Big Red Machine anchor won 10 Gold Gloves and two NL MVPs.",
        "Johnny Bench",
        "Carlton Fisk",
        "Gary Carter",
        "Thurman Munson",
        "He led the NL in homers twice and threw out over 43% of would-be base stealers.",
        "He batted .533 to claim 1976 World Series MVP honors in Cincinnati's sweep of the Yankees.",
        "Johnny Bench hit 389 home runs and redefined the catcher position on baseball's dominant 1970s Cincinnati Reds dynasty.",
        -100,
    ),
    (
        "pete_rose_4256",
        "IMMORTALS",
        "Known as 'Charlie Hustle' for sprinting to first on walks, this Reds switch-hitter broke Ty Cobb's record on his way to 4,256 hits.",
        "Pete Rose",
        "Joe Morgan",
        "Tony Perez",
        "Rod Carew",
        "He passed Cobb on September 11, 1985, with a single off Padres right-hander Eric Show.",
        "His 1989 lifetime ban for betting on baseball kept him off the Cooperstown ballot.",
        "Pete Rose played an MLB-record 3,562 games and tallied 4,256 hits across 24 seasons with the Reds, Phillies, and Expos.",
        -120,
    ),
    (
        "mike_schmidt_3_mvps",
        "IMMORTALS",
        "Combining 548 home runs with 10 Gold Gloves at the hot corner, this Phillies legend captured three NL MVP Awards and the 1980 Series MVP.",
        "Mike Schmidt",
        "George Brett",
        "Eddie Mathews",
        "Ron Santo",
        "He led the National League in home runs eight separate times during the 1970s and 1980s.",
        "He played his entire 18-year career in Philadelphia before retiring in 1989.",
        "Mike Schmidt's combination of eight home run crowns, 10 Gold Gloves, and three MVPs makes him widely acclaimed as MLB's greatest third baseman.",
        -95,
    ),
    (
        "brooks_robinson_vacuum",
        "IMMORTALS",
        "Dubbed 'The Human Vacuum Cleaner' after dazzling Cincinnati in the 1970 World Series, this Orioles third baseman won 16 straight Gold Gloves.",
        "Brooks Robinson",
        "Graig Nettles",
        "Clete Boyer",
        "Ken Boyer",
        "He spent all 23 MLB seasons in Baltimore and won the 1964 AL MVP Award.",
        "Reds catcher Johnny Bench joked that if he'd wanted a car for Series MVP, the Reds would have bought him one.",
        "Brooks Robinson's 16 consecutive Gold Gloves at third base (1960-1975) remain the record for any position player.",
        -90,
    ),
    (
        "ozzie_smith_wizard",
        "IMMORTALS",
        "Greeting St. Louis Opening Day crowds with a running backflip, 'The Wizard of Oz' claimed 13 consecutive Gold Gloves at shortstop.",
        "Ozzie Smith",
        "Luis Aparicio",
        "Omar Vizquel",
        "Mark Belanger",
        "Though never a power threat, he hit a dramatic walk-off homer in Game 5 of the 1985 NLCS.",
        "Jack Buck immortalized that swing with the radio call 'Go crazy, folks! Go crazy!'",
        "Ozzie Smith turned 1,590 double plays and set the MLB record with 8,375 career assists at shortstop.",
        -105,
    ),
    (
        "warren_spahn_363_lefty",
        "IMMORTALS",
        "After earning a Purple Heart and Bronze Star at the Battle of the Bulge, this Braves lefty still won 363 games - most by any southpaw.",
        "Warren Spahn",
        "Steve Carlton",
        "Lefty Grove",
        "Whitey Ford",
        "He recorded thirteen 20-win seasons and threw two no-hitters after turning 39.",
        "Boston fans coined the 1948 pennant rhyme 'Spahn and Sain and pray for rain.'",
        "Warren Spahn didn't earn his first MLB victory until age 25 after WWII, yet still amassed 363 wins across 21 seasons.",
        -70,
    ),
    (
        "tom_seaver_franchise",
        "IMMORTALS",
        "Known as 'Tom Terrific' and 'The Franchise', this right-hander went 25-7 to lead the 1969 Miracle Mets and won three NL Cy Young Awards.",
        "Tom Seaver",
        "Jerry Koosman",
        "Dwight Gooden",
        "Steve Carlton",
        "He struck out 10 consecutive Padres batters in a 19-strikeout gem on April 22, 1970.",
        "He finished with 311 wins and 3,640 strikeouts, entering Cooperstown with 98.8% of the vote in 1992.",
        "Tom Seaver transformed the laughingstock Mets into 1969 world champions and captured three Cy Young trophies in seven seasons.",
        -95,
    ),
    (
        "steve_carlton_1972_27",
        "IMMORTALS",
        "In 1972, this Phillies left-hander won 27 games for a last-place team that won only 59 all year - an astonishing 45.8% of club victories.",
        "Steve Carlton",
        "Ferguson Jenkins",
        "Tom Seaver",
        "Jim Palmer",
        "Armed with a wipeout slider, he became the first pitcher to win four Cy Young Awards.",
        "He retired with 329 wins and 4,136 strikeouts, second among lefties only to Randy Johnson.",
        "Steve Carlton captured the 1972 Pitching Triple Crown (27 W, 1.97 ERA, 310 SO) for a cellar-dwelling Philadelphia club.",
        -75,
    ),
    (
        "yastrzemski_1967_tc",
        "IMMORTALS",
        "Replacing Ted Williams in Fenway's left field, this Red Sox captain sparked 1967's 'Impossible Dream' pennant by winning the AL Triple Crown.",
        "Carl Yastrzemski",
        "Jim Rice",
        "Fred Lynn",
        "Tony Conigliaro",
        "A year later in 1968, he won the AL batting title with a .301 average - the lowest ever to lead a league.",
        "He played 23 seasons in Boston, finishing with 3,419 hits and 452 home runs.",
        "Carl Yastrzemski hit .326 with 44 homers and 121 RBIs in 1967, carrying Boston from ninth place to Game 7 of the World Series.",
        -80,
    ),
    (
        "reggie_jackson_3_pitches",
        "IMMORTALS",
        "Cementing his 'Mr. October' moniker in Game 6 of the 1977 World Series, this Yankees slugger homered on three straight pitches from three pitchers.",
        "Reggie Jackson",
        "Graig Nettles",
        "Thurman Munson",
        "Chris Chambliss",
        "He took Burt Hooton, Elias Sosa, and Charlie Hough deep into the Bronx night.",
        "He won five World Series rings (three with Oakland, two with New York) and two Series MVPs.",
        "Reggie Jackson belted five homers in the 1977 Fall Classic, capped by his unforgettable three-pitch, three-homer Game 6 outburst.",
        -115,
    ),
    (
        "george_brett_pine_tar",
        "IMMORTALS",
        "Bursting wildly out of the Royals dugout after his 1983 homer was nullified for excessive bat pine tar, this third baseman chased .400 in 1980.",
        "George Brett",
        "Mike Schmidt",
        "Paul Molitor",
        "Robin Yount",
        "AL President Lee MacPhail later upheld Kansas City's protest and restored his go-ahead blast.",
        "He hit .390 in 1980 and retired as the only player with batting titles in three different decades.",
        "George Brett tallied 3,154 hits all with Kansas City and starred in the iconic July 24, 1983 Pine Tar Game at Yankee Stadium.",
        -105,
    ),
    (
        "rod_carew_7_titles",
        "IMMORTALS",
        "Born on a train in the Panama Canal Zone, this sweet-swinging infielder won seven AL batting titles and stole home seven times in 1969.",
        "Rod Carew",
        "George Brett",
        "Tony Oliva",
        "Wade Boggs",
        "He batted .388 to win the 1977 AL MVP with Minnesota before later starring for the Angels.",
        "He collected 3,053 career hits and made 18 consecutive All-Star teams.",
        "Rod Carew's mastery of bunting, spray hitting, and stealing home made him one of baseball's purest contact artists.",
        -55,
    ),
    (
        "wade_boggs_chicken_man",
        "IMMORTALS",
        "Eating chicken before every game out of superstition, this Red Sox third baseman won five AL batting crowns and logged seven straight 200-hit years.",
        "Wade Boggs",
        "Don Mattingly",
        "Kirby Puckett",
        "Paul Molitor",
        "He famously celebrated the 1996 World Series title by riding a police horse around Yankee Stadium.",
        "He homered for his 3,000th career hit while playing for Tampa Bay in 1999.",
        "Wade Boggs batted .328 lifetime with a .415 OBP, riding an elite batting eye to five AL batting titles in Boston.",
        -75,
    ),
    (
        "kirby_puckett_1991_g6",
        "IMMORTALS",
        "After leaping against the Metrodome Plexiglas to rob Ron Gant, this Twins center fielder blasted an 11th-inning walk-off homer in 1991 Game 6.",
        "Kirby Puckett",
        "Kent Hrbek",
        "Paul Molitor",
        "Dave Winfield",
        "Jack Buck exclaimed 'And we'll see you tomorrow night!' as his blast cleared left-center.",
        "Glaucoma forced his sudden retirement at age 35 after 10 straight All-Star nods.",
        "Kirby Puckett won two World Series rings with Minnesota and delivered one of October's finest all-around games in 1991 Game 6.",
        -90,
    ),
    (
        "rollie_fingers_mustache",
        "IMMORTALS",
        "Twirling his iconic waxed handlebar mustache, this Athletics and Brewers closer became the first relief pitcher elected to Cooperstown in 1992.",
        "Rollie Fingers",
        "Goose Gossage",
        "Bruce Sutter",
        "Hoyt Wilhelm",
        "He won 1974 World Series MVP with Oakland and both AL MVP and Cy Young in 1981 with Milwaukee.",
        "He retired in 1985 as MLB's all-time saves leader with 341.",
        "Rollie Fingers anchored Oakland's 1972-1974 dynasty and paved the Hall of Fame path for pure bullpen specialists.",
        -70,
    ),
    (
        "dennis_eckersley_20w_50sv",
        "IMMORTALS",
        "Reinventing himself from a 20-game starter into a dominant closer, this right-hander became the first pitcher with both a 20-win and 50-save season.",
        "Dennis Eckersley",
        "John Smoltz",
        "Lee Smith",
        "Dan Quisenberry",
        "In 1990 he posted a microscopic 0.61 ERA with 48 saves and just four walks in 73.1 innings.",
        "He captured both the AL Cy Young and AL MVP Awards for Oakland in 1992.",
        "Dennis Eckersley won 20 games as a 1978 Red Sox starter and later saved 51 games for Oakland in 1992, earning a first-ballot plaque.",
        -50,
    ),
    (
        "bob_feller_opening_day_nh",
        "IMMORTALS",
        "Nicknamed 'Rapid Robert', this Cleveland fireballer threw MLB's only Opening Day no-hitter in 1940 before enlisting in the Navy right after Pearl Harbor.",
        "Bob Feller",
        "Hal Newhouser",
        "Lefty Gomez",
        "Early Wynn",
        "He missed nearly four full prime seasons serving aboard the battleship USS Alabama.",
        "Despite losing four war years, he still won 266 games and led the AL in strikeouts seven times.",
        "Bob Feller signed out of Iowa farmland at age 17, blanked the White Sox on Opening Day 1940, and returned from WWII to fan 348 in 1946.",
        -35,
    ),
    (
        "fergie_jenkins_canada",
        "IMMORTALS",
        "Rattling off six consecutive 20-win seasons for the Cubs from 1967 to 1972, this Chatham, Ontario native became Canada's first Cooperstown inductee.",
        "Ferguson Jenkins",
        "Larry Walker",
        "Bert Blyleven",
        "Gaylord Perry",
        "He won the 1971 NL Cy Young Award while pitching 325 innings with 30 complete games.",
        "He finished with 284 career wins and 3,192 strikeouts while issuing remarkably few walks.",
        "Ferguson Jenkins broke into Cooperstown in 1991 as the first Canadian-born inductee after starring for the Cubs and Rangers.",
        -25,
    ),
    (
        "fernando_valenzuela_1981",
        "IMMORTALS",
        "Sparking 'Fernandomania' with his skyward gaze and screwball in 1981, this Dodgers rookie became the only pitcher to win Cy Young and ROY together.",
        "Fernando Valenzuela",
        "Dwight Gooden",
        "Orel Hershiser",
        "Mark Fidrych",
        "He opened 1981 by winning his first eight starts with five shutouts and a 0.50 ERA.",
        "He tossed a 147-pitch complete game in Game 3 of the 1981 World Series against the Yankees.",
        "Born in Sonora, Mexico, Fernando Valenzuela captivated Los Angeles in 1981 and later pitched a 1990 no-hitter for the Dodgers.",
        -90,
    ),
    (
        "juan_marichal_leg_kick",
        "IMMORTALS",
        "Unleashing a sky-high left leg kick for the San Francisco Giants, 'The Dominican Dandy' outlasted Warren Spahn 1-0 in a 16-inning 1963 duel.",
        "Juan Marichal",
        "Orlando Cepeda",
        "Luis Tiant",
        "Bob Gibson",
        "He led the majors with 191 victories during the 1960s, yet never won a Cy Young Award.",
        "He became the first Dominican-born player inducted into the National Baseball Hall of Fame in 1983.",
        "Juan Marichal won 243 games with a 2.89 career ERA and hurled all 16 innings in his classic July 2, 1963 duel against Spahn.",
        -40,
    ),
    (
        "edgar_martinez_dh_award",
        "IMMORTALS",
        "MLB renamed its annual Outstanding Designated Hitter Award in honor of this five-time winner who spent all 18 seasons with Seattle.",
        "Edgar Martinez",
        "David Ortiz",
        "Harold Baines",
        "Frank Thomas",
        "His 11th-inning line drive in the 1995 ALDS scored Ken Griffey Jr. to beat the Yankees.",
        "He won two AL batting crowns and finished with a .312 average and .418 career OBP.",
        "Edgar Martinez elevated the DH craft to Hall of Fame heights, entering Cooperstown in 2019 after MLB named the DH award for him in 2004.",
        -60,
    ),
    (
        "clayton_kershaw_2014",
        "IMMORTALS",
        "Deploying a signature 12-to-6 curveball, this lifelong Dodgers lefty won three NL Cy Young Awards plus the 2014 NL MVP.",
        "Clayton Kershaw",
        "Max Scherzer",
        "Justin Verlander",
        "Zack Greinke",
        "He threw a 15-strikeout no-hitter against Colorado in June 2014 with zero walks.",
        "He won five NL ERA titles and helped Los Angeles capture the 2020 and 2024 World Series.",
        "Clayton Kershaw's career ERA near 2.50 is the lowest of any starting pitcher in the live-ball era with over 2,500 innings.",
        -105,
    ),
    (
        "max_scherzer_eyes",
        "IMMORTALS",
        "Instantly recognizable by one blue eye and one brown eye, this fierce competitor won three Cy Young Awards across both the AL and NL.",
        "Max Scherzer",
        "Justin Verlander",
        "Jacob deGrom",
        "Chris Sale",
        "He threw two no-hitters for Washington in 2015 and struck out 20 Tigers in a 2016 game.",
        "He won World Series rings with the 2019 Nationals and 2023 Rangers.",
        "Max Scherzer joined a tiny group of pitchers to capture Cy Young trophies in both leagues (2013 AL, 2016 and 2017 NL).",
        -85,
    ),
    (
        "justin_verlander_2011_mvp",
        "IMMORTALS",
        "Winning the AL Pitching Triple Crown, Cy Young, and AL MVP in 2011, this veteran ace also threw three career no-hitters and won two rings in Houston.",
        "Justin Verlander",
        "Max Scherzer",
        "Zack Greinke",
        "CC Sabathia",
        "He captured his third Cy Young unanimously in 2022 at age 39 after Tommy John surgery.",
        "Two of his three no-hitters came against the Toronto Blue Jays (2011 and 2019).",
        "Justin Verlander won 24 games with 250 strikeouts in 2011 to become the first starting pitcher to take AL MVP since Roger Clemens in 1986.",
        -80,
    ),
    (
        "adrian_beltre_head_touch",
        "IMMORTALS",
        "Notorious for hating teammates touching the top of his head, this joyful third baseman tallied 3,166 hits, 477 homers, and five Gold Gloves.",
        "Adrian Beltre",
        "Scott Rolen",
        "Chipper Jones",
        "Miguel Cabrera",
        "He starred for the Dodgers, Mariners, Red Sox, and Rangers, famously hitting homers from one knee.",
        "He earned first-ballot Hall of Fame induction in 2024 with 95.1% of the vote.",
        "Adrian Beltre became the first Dominican-born player to reach 3,000 hits while pairing elite defense with huge power.",
        -55,
    ),
    (
        "barry_bonds_762_hr",
        "IMMORTALS",
        "Winner of a record seven NL MVP Awards, this left-handed slugger set single-season marks with 73 homers (2001) and 232 walks (2004).",
        "Barry Bonds",
        "Mark McGwire",
        "Sammy Sosa",
        "Alex Rodriguez",
        "He broke Hank Aaron's career home run mark with number 756 on August 7, 2007.",
        "He is the only player in MLB history with both 500 home runs and 500 stolen bases.",
        "Barry Bonds finished with 762 home runs, 2,558 walks, and a .609 OBP in 2004 across 22 seasons with Pittsburgh and San Francisco.",
        -125,
    ),
    (
        "david_ortiz_big_papi",
        "IMMORTALS",
        "Known across New England as 'Big Papi', this clutch Red Sox DH authored walk-off heroes in 2004 and batted .688 to win 2013 World Series MVP.",
        "David Ortiz",
        "Manny Ramirez",
        "Pedro Martinez",
        "Dustin Pedroia",
        "After the 2013 Boston Marathon bombing, he rallied Fenway Park with an emotional microphone speech.",
        "He belted 541 career home runs and earned first-ballot Cooperstown election in 2022.",
        "David Ortiz powered Boston to three World Series championships (2004, 2007, 2013) with 17 career postseason homers.",
        -115,
    ),
    (
        "bob_clemente_skip_use_rogers_no_use_johan",
        "IMMORTALS",
        "Pitching for Minnesota in 2004 and 2006, this Venezuelan lefty with a devastating changeup won two unanimous AL Cy Young Awards and threw the Mets' first no-hitter.",
        "Johan Santana",
        "Felix Hernandez",
        "CC Sabathia",
        "Roy Halladay",
        "He captured the 2006 AL Pitching Triple Crown with 19 wins, a 2.77 ERA, and 245 strikeouts.",
        "His 134-pitch no-hitter on June 1, 2012, ended the Mets' 50-year drought without one.",
        "Johan Santana dominated the mid-2000s with an unhittable circle changeup before giving New York Mets fans their inaugural no-hitter in 2012.",
        -10,
    ),
    (
        "roy_halladay_doc_2010",
        "IMMORTALS",
        "Nicknamed 'Doc', this relentless workhorse threw a May perfect game and an October NLDS no-hitter in the same 2010 season for Philadelphia.",
        "Roy Halladay",
        "Cliff Lee",
        "Cole Hamels",
        "Tim Lincecum",
        "His postseason no-hitter against Cincinnati was only the second in MLB playoff history after Don Larsen.",
        "He won Cy Young Awards in both leagues (2003 Toronto, 2010 Philadelphia).",
        "Roy Halladay became the first pitcher since Don Larsen in 1956 to throw a postseason no-hitter and entered Cooperstown posthumously in 2019.",
        -55,
    ),
    (
        "joe_mauer_catcher_titles",
        "IMMORTALS",
        "Drafted first overall by his hometown Twins in 2001, this left-handed hitter became the only catcher in MLB history to win three batting titles.",
        "Joe Mauer",
        "Buster Posey",
        "Yadier Molina",
        "Ivan Rodriguez",
        "He batted .365 with 28 homers to capture the 2009 AL MVP Award.",
        "He earned first-ballot election to the National Baseball Hall of Fame in 2024.",
        "Joe Mauer captured AL batting crowns in 2006, 2008, and 2009 - a feat never matched by any other catcher in baseball history.",
        -60,
    ),
    (
        "ivan_rodriguez_pudge",
        "IMMORTALS",
        "Nicknamed 'Pudge', this rifle-armed Puerto Rican catcher won a record 13 Gold Gloves at the position and guided the 2003 Marlins to a title.",
        "Ivan Rodriguez",
        "Mike Piazza",
        "Yadier Molina",
        "Jorge Posada",
        "He won the 1999 AL MVP with Texas after posting 35 homers, 113 RBIs, and 25 steals.",
        "He caught an MLB-record 2,427 games and threw out 45.7% of base stealers.",
        "Ivan Rodriguez earned first-ballot Hall of Fame induction in 2017 after redefining defensive excellence behind home plate.",
        -55,
    ),
    (
        "mike_piazza_62nd_round",
        "IMMORTALS",
        "Selected in the 62nd round as a favor to Tommy Lasorda, this catcher defied 1,389-pick odds to hit an all-time position record 396 homers as a catcher.",
        "Mike Piazza",
        "Ivan Rodriguez",
        "Carlton Fisk",
        "Gary Carter",
        "His emotional go-ahead homer on September 21, 2001, lifted New York in the first pro game after 9/11.",
        "He hit 427 career home runs overall and entered Cooperstown in 2016.",
        "Mike Piazza became the lowest-drafted player ever inducted into the Hall of Fame, smashing 396 of his 427 homers while catching.",
        -75,
    ),
    (
        "chipper_jones_switch_hitter",
        "IMMORTALS",
        "Spending all 19 seasons in Atlanta, this switch-hitting third baseman hit 468 homers and holds the highest career batting average (.303) of any switch-hitter with 400+ HR.",
        "Chipper Jones",
        "Eddie Murray",
        "Mickey Mantle",
        "Carlos Beltran",
        "He won the 1999 NL MVP Award and batted .364 to claim the 2008 NL batting crown at age 36.",
        "He famously named one of his sons Shea after his career dominance at the Mets' stadium.",
        "Larry 'Chipper' Jones entered Cooperstown on the first ballot in 2018 with 97.2% after anchoring Atlanta's dynasty.",
        -70,
    ),
    (
        "eddie_murray_steady",
        "IMMORTALS",
        "Nicknamed 'Steady Eddie', this Orioles switch-hitter joined Hank Aaron and Willie Mays in the 500-HR, 3,000-hit club without ever hitting 34 homers in a season.",
        "Eddie Murray",
        "Cal Ripken Jr.",
        "Dave Winfield",
        "Andre Dawson",
        "His single-season high was 33 home runs, yet he reached 504 career homers and 3,255 hits.",
        "He won 1977 AL Rookie of the Year and helped Baltimore capture the 1983 World Series.",
        "Eddie Murray's remarkable switch-hitting consistency produced 504 homers, 1,917 RBIs, and a first-ballot Hall of Fame plaque in 2003.",
        -30,
    ),
    (
        "nolan_skip_use_frank_thomas",
        "IMMORTALS",
        "Known as 'The Big Hurt', this 6-foot-5 White Sox slugger became the first player to post seven straight seasons of .300 BA, 20 HR, 100 RBI, 100 R, and 100 BB.",
        "Frank Thomas",
        "Jeff Bagwell",
        "Jim Thome",
        "Fred McGriff",
        "A former Auburn football tight end, he won consecutive AL MVP Awards in 1993 and 1994.",
        "He finished with 521 career homers and a .419 OBP before entering Cooperstown in 2014.",
        "Frank Thomas's rare blend of 500-homer power and .419 plate discipline made him the dominant right-handed slugger of the 1990s.",
        -60,
    ),
    (
        "harmon_killebrew_logo_legend",
        "IMMORTALS",
        "Belting 573 career home runs for the Senators and Twins, this soft-spoken slugger's silhouette is widely cited as inspiring MLB's iconic batter logo.",
        "Harmon Killebrew",
        "Willie McCovey",
        "Frank Robinson",
        "Reggie Jackson",
        "He led the AL in home runs six times and won the 1969 AL MVP with 49 homers and 140 RBIs.",
        "His 520-foot blast at Metropolitan Stadium in 1967 is memorialized by a red seat in the Mall of America.",
        "Harmon Killebrew was the preeminent AL power hitter of the 1960s and entered the Hall of Fame in 1984.",
        -35,
    ),

    # -------------------------------------------------------------------------
    # THEME 2: OCTOBER_DRAMA (69 bespoke entries)
    # -------------------------------------------------------------------------
    (
        "ws_1903_first_series",
        "OCTOBER_DRAMA",
        "In October 1903, this Boston club rallied from a 3-1 deficit behind Cy Young and Bill Dinneen to defeat Pittsburgh in the first modern World Series.",
        "Boston Americans",
        "New York Giants",
        "Chicago Cubs",
        "Philadelphia Athletics",
        "The best-of-nine showdown ended 5 games to 3 at Huntington Avenue Grounds.",
        "The franchise adopted its famous Red Sox nickname five years later in 1908.",
        "The Boston Americans defeated Honus Wagner's Pittsburgh Pirates 5-3 in 1903, inaugurating the AL-vs-NL World Series.",
        -35,
    ),
    (
        "black_sox_1919",
        "OCTOBER_DRAMA",
        "Though acquitted by a Chicago jury in 1921, eight players from this club were banned for life by Commissioner Landis for conspiring to throw the 1919 World Series.",
        "Chicago White Sox",
        "Cincinnati Reds",
        "Chicago Cubs",
        "Detroit Tigers",
        "Shoeless Joe Jackson and Eddie Cicotte were among the banned 'Eight Men Out'.",
        "The scandal led MLB owners to appoint federal judge Kenesaw Mountain Landis as baseball's first commissioner.",
        "The 1919 Black Sox Scandal rocked American sports after gamblers paid White Sox players to lose the Fall Classic to Cincinnati.",
        -120,
    ),
    (
        "ws_1926_alexander_lazzeri",
        "OCTOBER_DRAMA",
        "Summoned from the bullpen in the 7th inning of 1926 World Series Game 7 with bases loaded, this 39-year-old Cardinals ace struck out Tony Lazzeri.",
        "Grover Cleveland Alexander",
        "Burleigh Grimes",
        "Dizzy Dean",
        "Jesse Haines",
        "He had already thrown a complete-game victory in Game 6 the previous afternoon.",
        "He closed the 9th inning as Babe Ruth was caught stealing second to end the Series.",
        "Grover Cleveland Alexander fanned Lazzeri after a long foul near the left-field pole and preserved St. Louis's 3-2 Game 7 triumph over the Yankees.",
        45,
    ),
    (
        "ws_1947_lavagetto_bevens",
        "OCTOBER_DRAMA",
        "With two outs in the 9th inning of 1947 World Series Game 4, Cookie Lavagetto's pinch-hit double spoiled this Yankees pitcher's bid for a Fall Classic no-hitter.",
        "Bill Bevens",
        "Allie Reynolds",
        "Vic Raschi",
        "Spud Chandler",
        "Despite issuing 10 walks, he stood one out away from history before Lavagetto hit the Ebbets Field wall.",
        "The double scored two runs, turning a 2-1 no-hitter into a stunning 3-2 Dodgers walk-off win.",
        "Bill Bevens never pitched another MLB game after 1947, forever remembered for coming within one out of the first World Series no-hitter.",
        65,
    ),
    (
        "shot_heard_1951",
        "OCTOBER_DRAMA",
        "'The Giants win the pennant!' screamed Russ Hodges on October 3, 1951, after this batter's walk-off homer off Ralph Branca won the NL playoff.",
        "Bobby Thomson",
        "Willie Mays",
        "Monte Irvin",
        "Alvin Dark",
        "Dubbed the Shot Heard 'Round the World, the 9th-inning three-run blast stunned Brooklyn at the Polo Grounds.",
        "Willie Mays was waiting in the on-deck circle when the ball cleared the left-field wall.",
        "Bobby Thomson's 1951 pennant-clinching home run capped the Giants' miracle 13.5-game August comeback against the Brooklyn Dodgers.",
        -105,
    ),
    (
        "ws_1954_the_catch_wertz",
        "OCTOBER_DRAMA",
        "In Game 1 of the 1954 World Series at the Polo Grounds, Willie Mays sprinted 420 feet with his back to home plate to rob which Cleveland slugger?",
        "Vic Wertz",
        "Al Rosen",
        "Larry Doby",
        "Bobby Avila",
        "The towering 8th-inning drive would have been a home run in every other MLB ballpark.",
        "Mays whirled and fired to hold Larry Doby at third before the Giants won in 10 innings.",
        "Willie Mays's iconic over-the-shoulder grab robbed Cleveland first baseman Vic Wertz and sparked the Giants' four-game sweep of the 111-win Indians.",
        25,
    ),
    (
        "ws_1955_brooklyn_podres",
        "OCTOBER_DRAMA",
        "'Wait till next year' finally ended in 1955 when this 23-year-old lefty shut out the Yankees 2-0 in Game 7 for Brooklyn's only World Series crown.",
        "Johnny Podres",
        "Don Newcombe",
        "Carl Erskine",
        "Sal Maglie",
        "Sandy Amoros sealed the game with a sprinting left-field catch and double play off Yogi Berra.",
        "He won the inaugural World Series MVP Award introduced by SPORT magazine in 1955.",
        "Johnny Podres won Games 3 and 7 to deliver the Brooklyn Dodgers their sole championship before moving to Los Angeles in 1958.",
        10,
    ),
    (
        "ws_1956_don_larsen",
        "OCTOBER_DRAMA",
        "Throwing 97 pitches with no windup on October 8, 1956, this journeyman Yankees righty authored the only perfect game in World Series history.",
        "Don Larsen",
        "Whitey Ford",
        "Bob Turley",
        "Johnny Kucks",
        "After Dale Mitchell took a called third strike, catcher Yogi Berra famously leaped into his arms.",
        "He finished his regular-season career with a losing 81-91 record yet achieved October immortality.",
        "Don Larsen retired all 27 Brooklyn Dodgers in Game 5 of the 1956 World Series, earning unanimous Series MVP honors.",
        -115,
    ),
    (
        "ws_1960_mazeroski",
        "OCTOBER_DRAMA",
        "Leading off the bottom of the 9th in Game 7 of the 1960 World Series, this slick-fielding Pirates second baseman hit the first Game 7 walk-off homer.",
        "Bill Mazeroski",
        "Roberto Clemente",
        "Dick Groat",
        "Hal Smith",
        "His blast over Yogi Berra's head off Ralph Terry gave Pittsburgh a wild 10-9 victory over the Yankees.",
        "The Yankees actually outscored Pittsburgh 55-27 across the seven games yet lost the Series.",
        "Bill Mazeroski's 1960 Game 7 blast over Forbes Field's ivy-covered wall remains the only Game 7 walk-off homer in World Series history.",
        -100,
    ),
    (
        "ws_1962_mccovey_line_drive",
        "OCTOBER_DRAMA",
        "With tying and winning runs on base and two outs in the 9th of 1962 World Series Game 7, Bobby Richardson snared a scorching liner off whose bat?",
        "Willie McCovey",
        "Willie Mays",
        "Orlando Cepeda",
        "Felipe Alou",
        "Charles Schulz later drew Charlie Brown lamenting 'Why couldn't McCovey have hit the ball just three feet higher?'",
        "Ralph Terry threw the decisive pitch at Candlestick Park to preserve a 1-0 Yankees win.",
        "Willie McCovey's blistering 9th-inning line drive landed straight in Bobby Richardson's glove, giving the Yankees a razor-thin 1962 title.",
        30,
    ),
    (
        "ws_1969_miracle_mets",
        "OCTOBER_DRAMA",
        "Rising from seven straight bottom-two finishes to win 100 games, this expansion club stunned Baltimore 4-1 in the 1969 World Series.",
        "New York Mets",
        "Houston Astros",
        "Los Angeles Angels",
        "Montreal Expos",
        "Tommie Agee made two miraculous Game 3 catches and shoe polish proved Cleon Jones was hit by a pitch in Game 5.",
        "Managed by Gil Hodges, they became known forever as the 'Miracle Mets'.",
        "The 1969 New York Mets became the first 1960s expansion franchise to capture a World Series championship.",
        -115,
    ),
    (
        "ws_1971_first_night_game",
        "OCTOBER_DRAMA",
        "Game 4 of the 1971 World Series at Pittsburgh's Three Rivers Stadium marked which broadcast milestone in Fall Classic history?",
        "First World Series night game",
        "First use of the designated hitter",
        "First instant replay review",
        "First World Series game on artificial turf",
        "Played on October 13, 1971, the game drew over 61 million television viewers.",
        "The Pirates beat Baltimore 4-3 under the lights en route to a seven-game championship.",
        "October 13, 1971, ushered in prime-time World Series baseball when Pittsburgh hosted Baltimore in the Fall Classic's first night contest.",
        -20,
    ),
    (
        "ws_1975_fisk_wave",
        "OCTOBER_DRAMA",
        "In the 12th inning of 1975 World Series Game 6, this Red Sox catcher frantically waved his arms to coax a soaring drive fair off Fenway's foul pole.",
        "Carlton Fisk",
        "Fred Lynn",
        "Jim Rice",
        "Bernie Carbo",
        "The left-field foul pole at Fenway Park is now officially named in his honor.",
        "NBC cameraman Lou Gerard stayed locked on him instead of the ball because a rat spooked him inside the Monster.",
        "Carlton Fisk's 12th-inning homer off Pat Darcy forced Game 7 and produced arguably the most famous television shot in sports history.",
        -120,
    ),
    (
        "bucky_dent_1978",
        "OCTOBER_DRAMA",
        "In the 1978 AL East one-game playoff at Fenway Park, this light-hitting Yankees shortstop stunned Boston with a 7th-inning homer over the Green Monster.",
        "Bucky Dent",
        "Fred Stanley",
        "Roy White",
        "Willie Randolph",
        "He had hit just four home runs all season before lifting Mike Torrez's pitch into the screen.",
        "The three-run blast turned a 2-0 Red Sox lead into a 3-2 Yankees edge en route to a 5-4 win.",
        "Bucky Dent's unlikely Fenway homer propelled the 1978 Yankees to the AL pennant and a second straight World Series title.",
        -105,
    ),
    (
        "ws_1979_stargell_trifecta",
        "OCTOBER_DRAMA",
        "Leading the 'We Are Family' Pirates past Baltimore in 1979, this slugger became the only player to win regular-season, LCS, and World Series MVP in one year.",
        "Willie Stargell",
        "Dave Parker",
        "Bill Madlock",
        "Kent Tekulve",
        "Affectionately called 'Pops', he handed out fabric stars to teammates for clutch plays.",
        "He shared the 1979 NL MVP with Keith Hernandez before dominating October at age 39.",
        "Willie Stargell batted .400 with three homers in the 1979 Fall Classic to complete baseball's only single-season MVP trifecta.",
        -35,
    ),
    (
        "ws_1980_tug_mcgraw",
        "OCTOBER_DRAMA",
        "Leaping skyward after striking out Willie Wilson in Game 6, reliever Tug McGraw secured which franchise's first World Series title in 97 seasons?",
        "Philadelphia Phillies",
        "Kansas City Royals",
        "Houston Astros",
        "Milwaukee Brewers",
        "Founded in 1883, they had been the last original 16 MLB club without a world championship.",
        "Mike Schmidt and Steve Carlton anchored the club past George Brett's Royals in six games.",
        "Philadelphia captured its inaugural World Series championship in 1980, ending a 97-year wait since the club's founding.",
        -60,
    ),
    (
        "ws_1984_sparky_both_leagues",
        "OCTOBER_DRAMA",
        "Guiding Detroit to a blazing 35-5 start and the 1984 title, this skipper became the first manager to win World Series crowns in both leagues.",
        "Sparky Anderson",
        "Tony La Russa",
        "Whitey Herzog",
        "Tommy Lasorda",
        "He had previously piloted Cincinnati's Big Red Machine to consecutive titles in 1975 and 1976.",
        "Tony La Russa later joined him in winning Fall Classics in both the AL and NL.",
        "Sparky Anderson managed the 1975-76 Reds and 1984 'Bless You Boys' Tigers to become MLB's first two-league championship skipper.",
        -35,
    ),
    (
        "ws_1985_denkinger_call",
        "OCTOBER_DRAMA",
        "Trailing 1-0 in the 9th inning of 1985 World Series Game 6, Kansas City sparked its championship rally after umpire Don Denkinger ruled which runner safe at first?",
        "Jorge Orta",
        "Dane Iorg",
        "Willie Wilson",
        "Buddy Biancalana",
        "Replays showed Cardinals pitcher Todd Worrell clearly beat him to the bag on the toss from Jack Clark.",
        "Dane Iorg's two-run single won Game 6 before Bret Saberhagen shut out St. Louis 11-0 in Game 7.",
        "Don Denkinger's missed safe call on Jorge Orta opened the door for Kansas City's 1985 World Series comeback over St. Louis.",
        30,
    ),
    (
        "ws_1986_buckner_wilson",
        "OCTOBER_DRAMA",
        "Down to their final strike with two outs and nobody on in 1986 World Series Game 6, the Mets capped their 10th-inning rally on whose slow roller past Bill Buckner?",
        "Mookie Wilson",
        "Ray Knight",
        "Gary Carter",
        "Kevin Mitchell",
        "A Bob Stanley wild pitch had just tied the game at 5-5 before the 10-pitch at-bat ended.",
        "Vin Scully cried 'Little roller up along first... behind the bag! It gets through Buckner!'",
        "Mookie Wilson's trickling grounder scored Ray Knight in Game 6, setting up New York's Game 7 triumph over Boston.",
        -115,
    ),
    (
        "ws_1988_kirk_gibson",
        "OCTOBER_DRAMA",
        "Barely able to walk on two injured legs, this Dodgers slugger limped off the bench in 1988 Game 1 to launch a one-handed walk-off homer off Dennis Eckersley.",
        "Kirk Gibson",
        "Orel Hershiser",
        "Mike Scioscia",
        "Steve Sax",
        "Vin Scully let the crowd roar for over a minute before saying 'In a year that has been so improbable, the impossible has happened!'",
        "He pumped his right fist rounding second in his only plate appearance of the entire World Series.",
        "Kirk Gibson ambushed a 3-2 backdoor slider from Oakland's Dennis Eckersley, propelling Los Angeles to a five-game World Series upset.",
        -125,
    ),
    (
        "ws_1989_earthquake",
        "OCTOBER_DRAMA",
        "Just before first pitch of Game 3 in 1989, the magnitude 6.9 Loma Prieta earthquake rocked Candlestick Park, delaying the 'Battle of the Bay' Series for 10 days between Oakland and whom?",
        "San Francisco Giants",
        "Los Angeles Dodgers",
        "San Diego Padres",
        "California Angels",
        "Al Michaels was live on ABC when the broadcast cut out after he exclaimed 'We're having an earth-'",
        "When play resumed 10 days later, Dave Stewart and Oakland completed a four-game sweep.",
        "The October 17, 1989 Loma Prieta earthquake interrupted the all-Bay Area World Series between the Oakland A's and San Francisco Giants.",
        -105,
    ),
    (
        "ws_1991_jack_morris_g7",
        "OCTOBER_DRAMA",
        "Refusing manager Tom Kelly's offer to leave after nine, this Twins ace pitched a 10-inning 1-0 shutout in Game 7 of the 1991 World Series.",
        "Jack Morris",
        "John Smoltz",
        "Kevin Tapani",
        "Tom Glavine",
        "Gene Larkin's bases-loaded single in the bottom of the 10th gave him the unforgettable 1-0 victory.",
        "Both Minnesota and Atlanta had finished in last place just one year earlier in 1990.",
        "Jack Morris threw 126 pitches across 10 scoreless frames against Atlanta, earning 1991 World Series MVP in a game widely hailed as baseball's greatest Game 7.",
        -95,
    ),
    (
        "nlcs_1992_sid_bream_slide",
        "OCTOBER_DRAMA",
        "In Game 7 of the 1992 NLCS, pinch-hitter Francisco Cabrera singled with two outs in the 9th to score which slow-footed Braves runner ahead of Barry Bonds's throw?",
        "Sid Bream",
        "David Justice",
        "Terry Pendleton",
        "Otis Nixon",
        "A former Pittsburgh Pirate himself, he beat Mike LaValliere's tag by an eyelash in Atlanta.",
        "The stunned Pirates would not return to the MLB postseason for another 21 years.",
        "Francisco Cabrera's improbable 9th-inning hit plated hobbled first baseman Sid Bream, sending the Braves back to the World Series.",
        -25,
    ),
    (
        "ws_1993_joe_carter",
        "OCTOBER_DRAMA",
        "'Touch 'em all, Joe!' thundered Tom Cheek after this Blue Jays slugger hit a 9th-inning three-run walk-off homer off Mitch Williams to win the 1993 World Series.",
        "Joe Carter",
        "Paul Molitor",
        "Roberto Alomar",
        "John Olerud",
        "He joined Bill Mazeroski as the only players ever to end a World Series with a walk-off home run.",
        "The blast turned a 6-5 Phillies lead into an 8-6 repeat championship in Toronto.",
        "Joe Carter's 1993 Game 6 blast gave Toronto back-to-back titles and remains the only walk-off World Series-winning homer hit by a team trailing in the 9th.",
        -115,
    ),
    (
        "alds_1995_the_double",
        "OCTOBER_DRAMA",
        "Scoring Ken Griffey Jr. all the way from first base in the 11th inning of 1995 ALDS Game 5, Edgar Martinez's 'The Double' saved MLB baseball in which city?",
        "Seattle",
        "Tampa Bay",
        "Montreal",
        "Oakland",
        "Play-by-play voice Dave Niehaus cried 'My, oh my!' as Griffey slid home beneath the Kingdome roof.",
        "The electrifying comeback over the Yankees helped secure funding for Safeco Field (now T-Mobile Park).",
        "Edgar Martinez's 1995 ALDS walk-off double kept baseball alive in Seattle and remains the defining moment in Mariners history.",
        -90,
    ),
    (
        "ws_1997_marlins_wildcard",
        "OCTOBER_DRAMA",
        "In just their fifth season of existence, this franchise became MLB's first Wild Card World Series champion on Edgar Renteria's 11th-inning Game 7 single.",
        "Florida Marlins",
        "Colorado Rockies",
        "Arizona Diamondbacks",
        "Tampa Bay Devil Rays",
        "Craig Counsell scored the winning run past Cleveland closer Jose Mesa in Miami.",
        "They repeated the Wild Card feat six years later by upsetting the Yankees in 2003.",
        "Managed by Jim Leyland, the 1997 Florida Marlins edged Cleveland 3-2 in 11 innings of Game 7 for MLB's first Wild Card title.",
        -75,
    ),
    (
        "ws_1998_yankees_125",
        "OCTOBER_DRAMA",
        "Compiling 114 regular-season victories and an 11-2 October run, this 1998 club set the MLB record for combined wins in a season at 125.",
        "New York Yankees",
        "Atlanta Braves",
        "San Diego Padres",
        "Houston Astros",
        "Scott Brosius won Series MVP as they swept Tony Gwynn's Padres in four games.",
        "David Wells threw a perfect game during that regular season under manager Joe Torre.",
        "The 1998 New York Yankees went 125-50 overall, widely regarded as one of the most complete teams in baseball history.",
        -95,
    ),
    (
        "ws_2000_subway_series",
        "OCTOBER_DRAMA",
        "Meeting in New York's first Subway World Series since 1956, the Yankees defeated the Mets 4-1 in 2000, fueled by Game 2's Roger Clemens bat-shard clash with whom?",
        "Mike Piazza",
        "Edgardo Alfonzo",
        "Robin Ventura",
        "John Franco",
        "Clemens had beaned the same star catcher with a fastball in July interleague play.",
        "Derek Jeter won World Series MVP as the Yankees completed a three-peat.",
        "The 2000 Subway Series featured intense drama between Roger Clemens and Mets catcher Mike Piazza as the Yankees won their 26th crown.",
        -85,
    ),
    (
        "ws_2001_luis_gonzalez",
        "OCTOBER_DRAMA",
        "In Game 7 of the 2001 World Series, this Diamondbacks outfielder blooped a broken-bat 9th-inning walk-off single over a drawn-in infield off Mariano Rivera.",
        "Luis Gonzalez",
        "Matt Williams",
        "Steve Finley",
        "Mark Grace",
        "Just four years after entering MLB, Arizona became the fastest expansion team ever to win a title.",
        "He had already hit 57 regular-season homers that year before poking the softest hit of his life.",
        "Luis Gonzalez's bloop single off baseball's greatest closer gave Arizona a 3-2 Game 7 victory in one of the most dramatic World Series ever played.",
        -105,
    ),
    (
        "alcs_2003_aaron_boone",
        "OCTOBER_DRAMA",
        "On the very first pitch of the bottom of the 11th in 2003 ALCS Game 7, this future Yankees manager homered off knuckleballer Tim Wakefield.",
        "Aaron Boone",
        "Jason Giambi",
        "Jorge Posada",
        "Bernie Williams",
        "He entered the game purely as a pinch runner before stepping to the plate for his sole at-bat.",
        "New York had rallied from a 5-2 deficit in the 8th against Pedro Martinez.",
        "Aaron Boone's 11th-inning blast broke Red Sox hearts in 2003 and set the stage for Boston's historic revenge one October later.",
        -95,
    ),
    (
        "alcs_2004_roberts_steal",
        "OCTOBER_DRAMA",
        "Trailing 4-3 in the 9th of 2004 ALCS Game 4 against Mariano Rivera, this pinch-runner's famous steal of second ignited MLB's only 3-0 postseason comeback.",
        "Dave Roberts",
        "Johnny Damon",
        "Kevin Millar",
        "Mark Bellhorn",
        "Bill Mueller promptly singled him home before David Ortiz won Game 4 in the 12th inning.",
        "He later managed the Los Angeles Dodgers to multiple World Series championships.",
        "Dave Roberts's iconic stolen base off Mariano Rivera triggered Boston's four-game rally from a 3-0 ALCS hole against the Yankees.",
        -115,
    ),
    (
        "ws_2004_curse_broken",
        "OCTOBER_DRAMA",
        "Sweeping St. Louis under a lunar eclipse in October 2004, which franchise snapped the 86-year 'Curse of the Bambino'?",
        "Boston Red Sox",
        "Chicago Cubs",
        "Chicago White Sox",
        "Cleveland Indians",
        "Curt Schilling's blood-soaked sock and Manny Ramirez's Series MVP fueled the October run.",
        "Reliever Keith Foulke flipped to Doug Mientkiewicz for the final out at Busch Stadium.",
        "The 2004 Boston Red Sox won their first World Series since 1918, erasing 86 years of heartbreak since Babe Ruth's sale.",
        -130,
    ),
    (
        "ws_2005_white_sox_cg",
        "OCTOBER_DRAMA",
        "Pitching four consecutive complete games in the ALCS and sweeping Houston, this Chicago club ended an 88-year title drought in 2005.",
        "Chicago White Sox",
        "Chicago Cubs",
        "Houston Astros",
        "Detroit Tigers",
        "Jermaine Dye won Series MVP while Paul Konerko hit a memorable Game 2 grand slam.",
        "Managed by Ozzie Guillen, they posted an extraordinary 11-1 postseason record.",
        "The 2005 Chicago White Sox claimed their first championship since 1917 behind rotation workhorses Mark Buehrle, Jon Garland, Freddy Garcia, and Jose Contreras.",
        -95,
    ),
    (
        "ws_2006_cardinals_83",
        "OCTOBER_DRAMA",
        "Entering October with just 83 regular-season wins - the fewest of any World Series champion - this club toppled Detroit in five games in 2006.",
        "St. Louis Cardinals",
        "Minnesota Twins",
        "New York Mets",
        "San Diego Padres",
        "Scrappy shortstop David Eckstein took home Series MVP honors.",
        "Rookie closer Adam Wainwright froze Carlos Beltran with a curveball to clinch the NLCS.",
        "Tony La Russa's 2006 St. Louis Cardinals overcame injuries and an 83-78 regular season to capture the franchise's 10th World Series crown.",
        -45,
    ),
    (
        "ws_2008_brad_lidge_48",
        "OCTOBER_DRAMA",
        "Finishing a flawless 48-for-48 in save chances including October, reliever Brad Lidge dropped to his knees after clinching the 2008 World Series for which club?",
        "Philadelphia Phillies",
        "Tampa Bay Rays",
        "Boston Red Sox",
        "Los Angeles Angels",
        "Game 5 was suspended by torrential rain after five and a half innings and resumed two days later.",
        "Cole Hamels swept both NLCS and World Series MVP trophies.",
        "Brad Lidge struck out Eric Hinske to seal Philadelphia's 2008 championship, completing a perfect 48-for-48 season in save opportunities.",
        -60,
    ),
    (
        "ws_2009_matsui_6_rbi",
        "OCTOBER_DRAMA",
        "Driving in six runs in Game 6 against Philadelphia, this Yankees DH became the first Japanese-born player to win World Series MVP in 2009.",
        "Hideki Matsui",
        "Ichiro Suzuki",
        "Shohei Ohtani",
        "Koji Uehara",
        "Nicknamed 'Godzilla', he tied Bobby Richardson's 1960 single-game World Series RBI record.",
        "The victory gave the New York Yankees their 27th World Series championship.",
        "Hideki Matsui batted .615 with three homers and eight RBIs in the 2009 Fall Classic, capping his Bronx tenure with Series MVP.",
        -80,
    ),
    (
        "ws_2011_david_freese",
        "OCTOBER_DRAMA",
        "Down to their final strike in both the 9th and 10th innings of 2011 World Series Game 6, St. Louis survived behind which hometown third baseman's triple and 11th-inning walk-off homer?",
        "David Freese",
        "Albert Pujols",
        "Lance Berkman",
        "Yadier Molina",
        "Joe Buck echoed his father's 1991 call: 'We will see you tomorrow night!'",
        "He set a postseason record with 21 RBIs and swept NLCS and World Series MVP awards.",
        "St. Louis native David Freese delivered the tying two-run triple in the 9th and winning homer in the 11th as the Cardinals stunned Texas in 2011.",
        -105,
    ),
    (
        "ws_2014_bumgarner_g7",
        "OCTOBER_DRAMA",
        "After throwing a Game 5 shutout, this Giants lefty emerged from the bullpen on two days' rest in 2014 Game 7 to spin five scoreless relief innings in Kansas City.",
        "Madison Bumgarner",
        "Tim Lincecum",
        "Matt Cain",
        "Johnny Cueto",
        "He finished his World Series career with an astounding 0.25 ERA across 36 innings.",
        "The victory completed San Francisco's even-year dynasty (2010, 2012, 2014) under Bruce Bochy.",
        "Madison Bumgarner threw 52.2 postseason innings in 2014 and locked down a five-inning Game 7 save against the Royals for Series MVP.",
        -105,
    ),
    (
        "alds_2015_bautista_flip",
        "OCTOBER_DRAMA",
        "Following a chaotic 53-minute 7th inning in 2015 ALDS Game 5 in Toronto, this Blue Jays slugger unleashed baseball's most famous modern bat flip.",
        "Jose Bautista",
        "Josh Donaldson",
        "Edwin Encarnacion",
        "Troy Tulowitzki",
        "Minutes earlier, catcher Russell Martin's throw back to the mound had bounced off Shin-Soo Choo's bat for a go-ahead Rangers run.",
        "He crushed Sam Dyson's 1-1 pitch deep into left field before flinging his bat skyward.",
        "Jose Bautista's emphatic three-run homer and bat flip against Texas became an iconic emblem of modern postseason emotion.",
        -90,
    ),
    (
        "ws_2016_cubs_108_years",
        "OCTOBER_DRAMA",
        "After a 17-minute rain delay in the 10th inning of Game 7 in Cleveland, this franchise ended North American sports' longest drought of 108 years in 2016.",
        "Chicago Cubs",
        "Cleveland Indians",
        "Boston Red Sox",
        "Chicago White Sox",
        "Ben Zobrist doubled home the go-ahead run after Jason Heyward's weight-room rain-delay speech.",
        "Kris Bryant smiled as he fired across the diamond to Anthony Rizzo for the final out.",
        "The Chicago Cubs outlasted Cleveland 8-7 in 10 innings on November 2, 2016, capturing their first World Series title since 1908.",
        -130,
    ),
    (
        "ws_2018_g3_18_innings",
        "OCTOBER_DRAMA",
        "Spanning 18 innings and 7 hours 20 minutes before Max Muncy's walk-off homer, Game 3 of the 2018 World Series pitted Boston against which NL opponent?",
        "Los Angeles Dodgers",
        "Houston Astros",
        "Milwaukee Brewers",
        "Atlanta Braves",
        "Nathan Eovaldi threw 97 heroic relief pitches in defeat before Boston won the Series in five games.",
        "It remains the longest game in World Series history by both innings and elapsed time.",
        "Max Muncy's 18th-inning blast ended the marathon 2018 Game 3 at Dodger Stadium, giving Los Angeles its lone win of the Series.",
        -60,
    ),
    (
        "ws_2019_road_team_all_7",
        "OCTOBER_DRAMA",
        "In 2019, this franchise won its first title in the ONLY seven-game World Series where the visiting road team won every single game.",
        "Washington Nationals",
        "Houston Astros",
        "Atlanta Braves",
        "Tampa Bay Rays",
        "Howie Kendrick's 7th-inning go-ahead homer clanged off Houston's right-field foul pole in Game 7.",
        "They had started the 2019 season 19-31 before riding 'Baby Shark' and Stephen Strasburg to the crown.",
        "The 2019 Washington Nationals won all four games in Houston while dropping three at home, making MLB history as road warriors.",
        -95,
    ),
    (
        "ws_2020_neutral_site",
        "OCTOBER_DRAMA",
        "Played entirely at neutral-site Globe Life Field in Arlington during the 2020 pandemic season, the World Series ended which club's 32-year title wait?",
        "Los Angeles Dodgers",
        "Tampa Bay Rays",
        "San Diego Padres",
        "Atlanta Braves",
        "Corey Seager won both NLCS and World Series MVP honors while Julio Urias closed Game 6.",
        "Rays manager Kevin Cash's controversial decision to pull a cruising Blake Snell swung Game 6.",
        "The 2020 Los Angeles Dodgers defeated Tampa Bay 4-2 in Texas to claim their first championship since 1988.",
        -90,
    ),
    (
        "ws_2021_braves_soler",
        "OCTOBER_DRAMA",
        "Rebuilding their entire outfield at the trade deadline after losing Ronald Acuna Jr., Atlanta won the 2021 World Series behind which Game 6 moonshot MVP?",
        "Jorge Soler",
        "Eddie Rosario",
        "Freddie Freeman",
        "Austin Riley",
        "His 446-foot 3rd-inning homer cleared the railroad tracks completely out of Minute Maid Park.",
        "He became just the second Cuban-born player to capture World Series MVP honors.",
        "Trade-deadline pickup Jorge Soler smashed three homers in the 2021 Fall Classic as Atlanta defeated Houston in six games.",
        -75,
    ),
    (
        "ws_2022_combined_nh",
        "OCTOBER_DRAMA",
        "In Game 4 of the 2022 World Series, Cristian Javier and three relievers threw only the second no-hitter in Fall Classic history for which club?",
        "Houston Astros",
        "Philadelphia Phillies",
        "New York Yankees",
        "San Diego Padres",
        "Bryan Abreu, Rafael Montero, and Ryan Pressly completed the 5-0 gem in Philadelphia.",
        "Two games later, 73-year-old manager Dusty Baker finally earned his first ring as a skipper.",
        "Houston's four-pitcher 2022 Game 4 no-hitter was the first World Series no-hitter since Don Larsen's 1956 perfect game.",
        -80,
    ),
    (
        "ws_2023_rangers_11_0_road",
        "OCTOBER_DRAMA",
        "Going an unprecedented 11-0 on the road throughout October, this franchise won its inaugural World Series crown in 2023 behind two-time MVP Corey Seager.",
        "Texas Rangers",
        "Arizona Diamondbacks",
        "Seattle Mariners",
        "Baltimore Orioles",
        "Skipper Bruce Bochy came out of retirement to capture his fourth World Series ring.",
        "Adolis Garcia smashed a postseason-record 22 RBIs en route to the club's first title since 1961.",
        "The 2023 Texas Rangers swept all 11 road postseason games and defeated Arizona 4-1 to claim their first championship.",
        -95,
    ),
    (
        "ws_2024_freeman_grand_slam",
        "OCTOBER_DRAMA",
        "Playing on a badly sprained ankle in Game 1 of the 2024 World Series, this Dodgers first baseman hit the FIRST walk-off grand slam in Fall Classic history.",
        "Freddie Freeman",
        "Shohei Ohtani",
        "Mookie Betts",
        "Teoscar Hernandez",
        "He ambushed Nestor Cortes's first-pitch fastball with two outs in the 10th inning against the Yankees.",
        "He homered in four straight games to tie a Series mark and capture 2024 World Series MVP.",
        "Freddie Freeman's 10th-inning grand slam on October 25, 2024, echoed Kirk Gibson's 1988 Game 1 magic and propelled Los Angeles to the title.",
        -120,
    ),
    (
        "ws_2025_yamamoto_dodgers",
        "OCTOBER_DRAMA",
        "Capturing back-to-back titles in a seven-game 2025 World Series thriller over the Toronto Blue Jays, the Dodgers were led by which Japanese World Series MVP?",
        "Yoshinobu Yamamoto",
        "Shohei Ohtani",
        "Roki Sasaki",
        "Shota Imanaga",
        "He signed a record pitching contract with Los Angeles after winning three Sawamura Awards in Japan.",
        "Los Angeles edged Toronto 4-3 in the 2025 Fall Classic.",
        "Yoshinobu Yamamoto earned 2025 World Series MVP as the Dodgers topped the Blue Jays in seven games.",
        -80,
    ),
    (
        "ws_1949_1953_five_peat",
        "OCTOBER_DRAMA",
        "Under manager Casey Stengel, the New York Yankees won an MLB-record five consecutive World Series championships spanning which five seasons?",
        "1949 to 1953",
        "1936 to 1940",
        "1956 to 1960",
        "1996 to 2000",
        "Joe DiMaggio anchored the early titles while young Mickey Mantle and Whitey Ford joined the later runs.",
        "Three of those five championships came at the expense of the Brooklyn Dodgers.",
        "Casey Stengel's Yankees defeated the Dodgers (1949, 1952, 1953), Phillies (1950), and Giants (1951) for baseball's only five-peat.",
        -30,
    ),
    (
        "ws_1972_1974_swingin_as",
        "OCTOBER_DRAMA",
        "Decked out in vibrant green-and-gold double-knits and bold mustaches, this franchise won three straight World Series from 1972 to 1974.",
        "Oakland Athletics",
        "Cincinnati Reds",
        "Baltimore Orioles",
        "Pittsburgh Pirates",
        "Owned by maverick Charles Finley, they starred Reggie Jackson, Catfish Hunter, and Vida Blue.",
        "No other AL club outside New York has ever won three consecutive World Series.",
        "The 'Swingin' A's' defeated the Reds (1972), Mets (1973), and Dodgers (1974) despite legendary clubhouse feuds.",
        -75,
    ),
    (
        "ws_1941_mickey_owen",
        "OCTOBER_DRAMA",
        "With two outs in the 9th of 1941 World Series Game 4, Brooklyn catcher Mickey Owen dropped Tommy Henrich's swinging third strike off which pitcher, sparking a Yankees rally?",
        "Hugh Casey",
        "Whit Wyatt",
        "Curt Davis",
        "Kirby Higbe",
        "The passed ball turned what would have been a Series-tying Dodgers victory into a 7-4 Yankees win.",
        "New York wrapped up the championship the very next afternoon at Ebbets Field.",
        "Mickey Owen's infamous dropped third strike on a sharp breaking ball from Hugh Casey triggered four unearned Yankees runs in 1941 Game 4.",
        75,
    ),
    (
        "ws_1946_mad_dash",
        "OCTOBER_DRAMA",
        "Ignoring third-base coach Mike Gonzalez's stop sign in the 8th inning of 1946 World Series Game 7, this Cardinals outfielder scored from first on a single in the 'Mad Dash'.",
        "Enos Slaughter",
        "Stan Musial",
        "Harry Walker",
        "Red Schoendienst",
        "Red Sox shortstop Johnny Pesky briefly hesitated on the relay throw as the runner sped home.",
        "Harry Walker's hit to left-center gave St. Louis a decisive 4-3 triumph over Ted Williams's Red Sox.",
        "Enos 'Country' Slaughter's fearless dash from first to home broke a 3-3 tie in Game 7 of the 1946 Fall Classic.",
        20,
    ),
    (
        "nlcs_1973_ya_gotta_believe",
        "OCTOBER_DRAMA",
        "Sitting in last place on August 30, 1973, the Mets rallied to capture the NL pennant behind which reliever's rallying cry 'Ya Gotta Believe!'?",
        "Tug McGraw",
        "Tom Seaver",
        "Jerry Koosman",
        "Bud Harrelson",
        "He went 5-0 with 12 saves and a 0.88 ERA over the final month to push New York to 82-79.",
        "Seven years later he struck out the final batter of the 1980 World Series for Philadelphia.",
        "Tug McGraw's infectious 'Ya Gotta Believe!' mantra lifted the 1973 Mets from last place to within one win of upsetting Oakland.",
        -15,
    ),
    (
        "alcs_1976_chambliss",
        "OCTOBER_DRAMA",
        "After blasting a 9th-inning walk-off homer to win the 1976 ALCS, this Yankees first baseman had to fight through thousands of field-storming fans just to touch home plate.",
        "Chris Chambliss",
        "Thurman Munson",
        "Graig Nettles",
        "Mickey Rivers",
        "His first-pitch blast off Royals reliever Mark Littell returned New York to the World Series after 12 years.",
        "Because fans stole home plate, umpires had to escort him back from the clubhouse to step on the dirt spot.",
        "Chris Chambliss tackled a fan near second base and returned under police escort to officially score the 1976 pennant-winning run.",
        10,
    ),
    (
        "alcs_1986_dave_henderson",
        "OCTOBER_DRAMA",
        "One strike from elimination in the 9th inning of 1986 ALCS Game 5, this Red Sox outfielder homered off Donnie Moore to stun the California Angels.",
        "Dave Henderson",
        "Jim Rice",
        "Dwight Evans",
        "Don Baylor",
        "Two innings later he drove in the winning sacrifice fly as Boston rallied to take the pennant in seven.",
        "He later won a World Series ring with Oakland in 1989.",
        "Dave 'Hendu' Henderson's dramatic two-out, two-strike blast saved Boston's 1986 season in Anaheim.",
        25,
    ),
    (
        "ws_1990_nasty_boys",
        "OCTOBER_DRAMA",
        "Sweeping the defending champion Oakland A's in 1990, the Cincinnati Reds unleashed a lockdown bullpen trio dubbed 'The Nasty Boys': Rob Dibble, Randy Myers, and whom?",
        "Norm Charlton",
        "John Franco",
        "Jeff Brantley",
        "Danny Jackson",
        "The trio allowed zero earned runs across the four-game World Series sweep.",
        "Billy Hatcher batted an astonishing .750 (9-for-12) in the Series while Jose Rijo won MVP.",
        "Norm Charlton, Rob Dibble, and Randy Myers shut down Oakland's Bash Brothers as Lou Piniella's Reds swept the 1990 Fall Classic.",
        20,
    ),
    (
        "ws_1995_glavine_atlanta",
        "OCTOBER_DRAMA",
        "Pitching eight innings of one-hit shutout ball in Game 6 of the 1995 World Series, this lefty brought Atlanta its first major pro sports championship.",
        "Tom Glavine",
        "Greg Maddux",
        "John Smoltz",
        "Steve Avery",
        "David Justice's 6th-inning solo homer provided the lone run in the 1-0 clincher over Cleveland.",
        "He won 305 career games and two NL Cy Young Awards.",
        "Tom Glavine painted the outside corner against Cleveland's powerhouse 1995 lineup to earn World Series MVP.",
        -45,
    ),
    (
        "ws_1996_leyritz_g4",
        "OCTOBER_DRAMA",
        "Trailing 6-0 in Game 4 of the 1996 World Series, the Yankees flipped the series on this backup catcher's dramatic 8th-inning three-run homer off Mark Wohlers.",
        "Jim Leyritz",
        "Joe Girardi",
        "Tino Martinez",
        "Paul O'Neill",
        "New York had lost the first two games at home before winning four straight against Atlanta.",
        "The blast tied the game 6-6 before Wade Boggs drew a bases-loaded go-ahead walk in the 10th.",
        "Jim Leyritz's Game 4 equalizer ignited the Yankees' 1996-2000 dynasty under Joe Torre.",
        15,
    ),
    (
        "ws_2002_angels_monkey",
        "OCTOBER_DRAMA",
        "Down 5-0 in the 7th inning of 2002 World Series Game 6 and six outs from elimination, which club rallied behind its 'Rally Monkey' to beat Barry Bonds's Giants?",
        "Anaheim Angels",
        "Oakland Athletics",
        "Seattle Mariners",
        "Arizona Diamondbacks",
        "Scott Spiezio's three-run homer ignited the comeback before Troy Glaus won Series MVP.",
        "John Lackey became the first rookie since 1909 to win a World Series Game 7.",
        "Mike Scioscia's Anaheim Angels scored six unanswered runs in Game 6 and won Game 7 for the franchise's lone World Series title.",
        -65,
    ),
    (
        "nlcs_2003_bartman",
        "OCTOBER_DRAMA",
        "Five outs from their first World Series since 1945, the 2003 Cubs unraveled for eight 8th-inning runs after a Wrigley Field fan deflected a foul ball away from which outfielder?",
        "Moises Alou",
        "Sammy Sosa",
        "Kenny Lofton",
        "Corey Patterson",
        "Luis Castillo walked on the sequence before Alex Gonzalez booted a routine double-play grounder.",
        "Florida won Games 6 and 7 to advance and upset the Yankees in the World Series.",
        "The 2003 NLCS Game 6 foul-ball incident involving Moises Alou and Steve Bartman haunted Wrigley Field until the Cubs won it all in 2016.",
        -85,
    ),
    (
        "ws_2010_ricketts_no_giants_first",
        "OCTOBER_DRAMA",
        "Defeating Texas 4-1 behind Edgar Renteria's Game 5 homer and Tim Lincecum's 10 strikeouts, which franchise won its first title since relocating west in 1958?",
        "San Francisco Giants",
        "Los Angeles Dodgers",
        "Oakland Athletics",
        "San Diego Padres",
        "It snapped a 56-year championship drought dating back to the 1954 New York Giants.",
        "It launched Bruce Bochy's run of three championships in five seasons.",
        "The 2010 San Francisco Giants captured the city's inaugural World Series title and began an iconic even-year dynasty.",
        -70,
    ),
    (
        "ws_2013_ortiz_fenway",
        "OCTOBER_DRAMA",
        "Batting .688 with an absurd 1.948 OPS against St. Louis, David Ortiz propelled Boston to its first title clinched at Fenway Park since which year?",
        "1918",
        "1903",
        "1946",
        "1967",
        "Boston's 2004 and 2007 championships were both clinched on the road in St. Louis and Denver.",
        "Closer Koji Uehara struck out Matt Carpenter to seal Game 6 in front of the Green Monster.",
        "The 2013 Red Sox gave Fenway Park its first home World Series clincher in 95 years, since Babe Ruth's 1918 club.",
        -30,
    ),
    (
        "ws_2015_royals_comeback",
        "OCTOBER_DRAMA",
        "Erasing deficits in the 8th inning or later in three of their four wins, this Midwest club topped the Mets 4-1 to win the 2015 World Series.",
        "Kansas City Royals",
        "Detroit Tigers",
        "St. Louis Cardinals",
        "Cleveland Indians",
        "Eric Hosmer's daring 9th-inning dash home tied Game 5 before Salvador Perez claimed Series MVP.",
        "It was their first championship since 1985 after losing 2014 Game 7 to Madison Bumgarner.",
        "Ned Yost's 2015 Kansas City Royals relentlessly pressured defenses late in games to capture the club's second title.",
        -60,
    ),
    (
        "ws_1982_whiteyball",
        "OCTOBER_DRAMA",
        "Pitting 'Harvey's Wallbangers' against 'Whiteyball' in a battle of beer-capital rivals, the 1982 'Suds Series' saw St. Louis defeat which franchise in seven games?",
        "Milwaukee Brewers",
        "Chicago White Sox",
        "Baltimore Orioles",
        "Kansas City Royals",
        "Robin Yount won AL MVP that year while Cardinals closer Bruce Sutter nailed down Game 7.",
        "Darrell Porter earned both NLCS and World Series MVP honors for Whitey Herzog's Cardinals.",
        "The 1982 World Series matched St. Louis (Anheuser-Busch) against Milwaukee (Miller), with the Cardinals taking Game 7 by a 6-3 score.",
        -25,
    ),
    (
        "ws_1976_big_red_sweep",
        "OCTOBER_DRAMA",
        "Sweeping Philadelphia 3-0 in the NLCS and New York 4-0 in the World Series, which 1976 juggernaut went a perfect 7-0 in the postseason?",
        "Cincinnati Reds",
        "Oakland Athletics",
        "Baltimore Orioles",
        "Los Angeles Dodgers",
        "Their 'Great Eight' lineup featured Johnny Bench, Joe Morgan, Pete Rose, and Tony Perez.",
        "They remain the only team to sweep every round of the LCS-era postseason without a single loss.",
        "Sparky Anderson's 1976 Big Red Machine repeated as World Series champions with an unblemished 7-0 October march.",
        -55,
    ),
    (
        "ws_1964_lou_brock_trade",
        "OCTOBER_DRAMA",
        "Acquiring speedster Lou Brock from the Cubs in June for Ernie Broglio ignited which club's surge to the 1964 World Series title over the Yankees?",
        "St. Louis Cardinals",
        "Philadelphia Phillies",
        "San Francisco Giants",
        "Cincinnati Reds",
        "Philadelphia's infamous 10-game September collapse opened the door in the NL pennant race.",
        "Bob Gibson won Games 5 and 7 to end the Yankees' 1960s pennant dynasty.",
        "The lopsided 1964 Brock-for-Broglio trade propelled St. Louis to the championship and sent Lou Brock toward 3,023 career hits.",
        -10,
    ),
    (
        "ws_1932_called_shot",
        "OCTOBER_DRAMA",
        "In Game 3 of the 1932 World Series at Wrigley Field, Babe Ruth gestured toward the outfield before launching his mythical 'Called Shot' off which Cubs pitcher?",
        "Charlie Root",
        "Lon Warneke",
        "Guy Bush",
        "Pat Malone",
        "Ruth and Gehrig each homered twice in New York's 7-5 win en route to a four-game sweep.",
        "Root always insisted Ruth was pointing at the dugout or signaling two strikes, not center field.",
        "Babe Ruth's 5th-inning blast off Charlie Root at Wrigley Field remains baseball's most debated and celebrated gesture.",
        -30,
    ),
    (
        "ws_1908_cubs_dynasty",
        "OCTOBER_DRAMA",
        "Before enduring a 108-year drought, the Chicago Cubs repeated as World Series champions in 1907 and 1908 by defeating which American League opponent twice?",
        "Detroit Tigers",
        "Philadelphia Athletics",
        "Chicago White Sox",
        "Boston Red Sox",
        "Ty Cobb played in both Fall Classics yet never won a World Series ring in his career.",
        "Pitcher Mordecai 'Three Finger' Brown and the Tinker-to-Evers-to-Chance infield led Chicago.",
        "The Cubs beat Detroit 4-0 (with one tie) in 1907 and 4-1 in 1908, becoming MLB's first back-to-back World Series champions.",
        5,
    ),
    (
        "ws_1929_as_10_run_inning",
        "OCTOBER_DRAMA",
        "Trailing 8-0 in the 7th inning of 1929 World Series Game 4 against the Cubs, Connie Mack's Philadelphia Athletics exploded for how many runs in that single frame?",
        "10",
        "7",
        "12",
        "8",
        "Hack Wilson lost two fly balls in the autumn sun during the stunning comeback.",
        "It remains the biggest single-inning scoring outburst in World Series history.",
        "Philadelphia scored 10 runs in the bottom of the 7th to win Game 4 by a 10-8 score, matching Detroit's 1968 10-run inning as the Fall Classic record.",
        40,
    ),
    (
        "ws_1977_g6_bronx_burning",
        "OCTOBER_DRAMA",
        "During Game 2 of the 1977 World Series, a camera panned to a nearby abandoned school ablaze in the South Bronx, prompting Howard Cosell's famous line about which ballpark's surroundings?",
        "Yankee Stadium",
        "Shea Stadium",
        "Fenway Park",
        "Comiskey Park",
        "Reggie Jackson's three-homer Game 6 capped that turbulent New York October against the Dodgers.",
        "Billy Martin managed New York to its first championship in 15 seasons.",
        "Though Cosell actually said 'The Bronx is burning' in legend (he noted the fire live on ABC), the 1977 Series became synonymous with New York's gritty era.",
        -45,
    ),
    (
        "ws_2024_g5_comeback",
        "OCTOBER_DRAMA",
        "Erasing a 5-0 deficit in a wild five-run 5th inning in the Bronx, the 2024 Dodgers won Game 5 to clinch their eighth title as which starter turned surprise closer recorded the final outs?",
        "Walker Buehler",
        "Jack Flaherty",
        "Yoshinobu Yamamoto",
        "Blake Treinen",
        "He had thrown five scoreless innings as the winning Game 3 starter just two days earlier.",
        "He struck out Alex Verdugo on a knuckle-curve to finish the 7-6 clincher.",
        "Walker Buehler emerged from the bullpen on short rest in Game 5 to retire the Yankees in order and seal the Dodgers' 2024 championship.",
        -40,
    ),
    (
        "ws_1981_trio_mvp",
        "OCTOBER_DRAMA",
        "The 1981 World Series is the only Fall Classic with three co-MVPs - Ron Cey, Steve Yeager, and Pedro Guerrero - all starring for which champion club?",
        "Los Angeles Dodgers",
        "New York Yankees",
        "Montreal Expos",
        "Oakland Athletics",
        "They rallied after dropping Games 1 and 2 in New York to beat the Yankees in six.",
        "Guerrero drove in five runs in the clinching 9-2 Game 6 victory at Yankee Stadium.",
        "Los Angeles's Ron Cey, Pedro Guerrero, and Steve Yeager shared the 1981 World Series MVP Award, a three-way honor never repeated.",
        35,
    ),
    (
        "alcs_1999_2000_jeter_flip",
        "OCTOBER_DRAMA",
        "Sprinting far across the diamond to field Shane Spencer's errant cutoff throw in the 2001 ALDS, Derek Jeter backhand-shoveled home to nail which Oakland baserunner?",
        "Jeremy Giambi",
        "Jason Giambi",
        "Miguel Tejada",
        "Eric Chavez",
        "Catcher Jorge Posada applied the tag just before the runner's upright step reached home plate.",
        "Yankees fans forever remember the play as 'The Flip', preserving a 1-0 Game 3 win.",
        "Derek Jeter's uncanny instinct cut off the overthrown relay and retired Jeremy Giambi - who infamously chose not to slide - saving New York's 2001 season.",
        -45,
    ),
    (
        "ws_2017_g5_13_12",
        "OCTOBER_DRAMA",
        "Featuring seven home runs and five lead changes in a 5-hour-17-minute shootout, 2017 World Series Game 5 ended 13-12 in 10 innings on Alex Bregman's walk-off hit for which club?",
        "Houston Astros",
        "Los Angeles Dodgers",
        "Chicago Cubs",
        "New York Yankees",
        "Clayton Kershaw and Dallas Keuchel both started, yet both bullpens surrendered huge rallies.",
        "Yuli Gurriel, Jose Altuve, and Yasiel Puig all homered in the wild Minute Maid Park slugfest.",
        "Alex Bregman singled home Derek Fisher off Kenley Jansen to cap 2017 Game 5, one of the wildest offensive thrillers in World Series annals.",
        -50,
    ),
    (
        "nlcs_1988_hershiser_dodgers",
        "OCTOBER_DRAMA",
        "Closing the 1988 regular season with 59 straight scoreless innings, this 'Bulldog' right-hander won NLCS MVP, World Series MVP, and the NL Cy Young Award.",
        "Orel Hershiser",
        "Dwight Gooden",
        "Fernando Valenzuela",
        "Dave Stewart",
        "He tossed a Game 2 shutout and went 3-for-3 at the plate before winning Game 5 in Oakland.",
        "He broke fellow Dodger Don Drysdale's 1968 scoreless-innings streak on the final day of the season.",
        "Orel Hershiser's 1988 autumn remains the finest pitching triple crown of hardware in MLB history: Cy Young, NLCS MVP, and World Series MVP.",
        -80,
    ),
    (
        "ws_1992_blue_jays_first_canada",
        "OCTOBER_DRAMA",
        "Defeating Atlanta in six games on Dave Winfield's 11th-inning Game 6 double, which team brought the World Series trophy outside the United States for the first time in 1992?",
        "Toronto Blue Jays",
        "Montreal Expos",
        "Seattle Mariners",
        "Minnesota Twins",
        "Pat Borders batted .450 to claim unexpected World Series MVP honors.",
        "They defended the crown one year later on Joe Carter's famous walk-off blast.",
        "Cito Gaston's 1992 Toronto Blue Jays became the first Canadian franchise to win the Fall Classic, hoisting the trophy in Atlanta.",
        -80,
    ),
    (
        "ws_1934_gashouse_gang",
        "OCTOBER_DRAMA",
        "Powered by Dizzy and Paul Dean winning all four Fall Classic games, St. Louis's gritty 1934 World Series champions earned what famous nickname?",
        "The Gashouse Gang",
        "Murderers' Row",
        "The Whiz Kids",
        "The Big Red Machine",
        "Player-manager Frankie Frisch, Pepper Martin, and Joe Medwick defined their dirt-stained hustle.",
        "Dizzy famously predicted 'Me and Paul will win 45 games' - they won 49 plus four in October.",
        "The 1934 Cardinals ('The Gashouse Gang') outlasted Detroit in seven games behind the Dean brothers' pitching.",
        -35,
    ),
    (
        "ws_1950_whiz_kids",
        "OCTOBER_DRAMA",
        "Averaging just 26 years old and clinching the pennant on Dick Sisler's 10th-inning homer on the final day, which 1950 NL champion club was nicknamed 'The Whiz Kids'?",
        "Philadelphia Phillies",
        "Brooklyn Dodgers",
        "Boston Braves",
        "New York Giants",
        "Richie Ashburn, Robin Roberts, and MVP closer Jim Konstanty spearheaded the youthful roster.",
        "Though swept by the Yankees in the World Series, three of the four games were decided by one run.",
        "The 1950 'Whiz Kids' delivered Philadelphia its first National League pennant since 1915.",
        20,
    ),
    (
        "ws_1924_pebble_bouncer",
        "OCTOBER_DRAMA",
        "In the 12th inning of 1924 World Series Game 7, Earl McNeely's routine grounder struck a pebble and hopped over Freddie Lindstrom's head, giving which franchise its lone Washington title?",
        "Washington Senators",
        "New York Giants",
        "St. Louis Browns",
        "Chicago White Sox",
        "Earlier in the 8th inning, Bucky Harris's grounder had ALSO hit a pebble at Griffith Stadium!",
        "Walter Johnson pitched four innings of scoreless relief to earn the unforgettable Game 7 win.",
        "Two uncanny pebble-aided hops lifted the 1924 Washington Senators past John McGraw's Giants for Washington's only MLB title until 2019.",
        45,
    ),
    (
        "ws_2012_sandoval_3_hr",
        "OCTOBER_DRAMA",
        "Blasting three home runs in Game 1 against Justin Verlander and Detroit, which nickname-famous Giants third baseman sparked San Francisco's 2012 World Series sweep?",
        "Pablo Sandoval",
        "Buster Posey",
        "Hunter Pence",
        "Marco Scutaro",
        "Known as 'Kung Fu Panda', he joined Babe Ruth, Reggie Jackson, and Albert Pujols in the three-homer WS club.",
        "He batted .500 across the four-game sweep to earn 2012 World Series MVP.",
        "Pablo Sandoval went deep twice off Verlander and once off Al Alburquerque in Game 1 as the Giants swept Detroit.",
        -50,
    ),
    (
        "ws_1967_gibson_3_cg",
        "OCTOBER_DRAMA",
        "Throwing three complete-game victories - and even homering in Game 7 - Bob Gibson lifted St. Louis past Carl Yastrzemski's Red Sox in which classic World Series?",
        "1967 World Series",
        "1964 World Series",
        "1968 World Series",
        "1975 World Series",
        "Lou Brock swiped a Fall Classic record seven bases during the seven-game showdown.",
        "Jim Lonborg won Games 2 and 5 for Boston before pitching on two days' rest in Game 7.",
        "Bob Gibson went 3-0 with a 1.00 ERA across 27 innings in the 1967 World Series to capture his second Fall Classic MVP.",
        -20,
    ),
    (
        "ws_1957_milwaukee_braves",
        "OCTOBER_DRAMA",
        "Just four years after moving from Boston, this franchise won its lone Wisconsin championship in 1957 as Lew Burdette threw three complete games against the Yankees.",
        "Milwaukee Braves",
        "Milwaukee Brewers",
        "St. Louis Cardinals",
        "Chicago Cubs",
        "Hank Aaron batted .393 with three homers during his 1957 NL MVP season.",
        "Burdette pitched consecutive shutouts in Games 5 and 7 to defeat New York.",
        "The 1957 Milwaukee Braves brought Wisconsin its only World Series trophy, topping Mickey Mantle's Yankees in seven games.",
        -15,
    ),
]


SIGNATURE_DIAMOND_CLASSICS.extend([
    # -------------------------------------------------------------------------
    # THEME 3: RECORDS_FEATS (74 bespoke entries)
    # -------------------------------------------------------------------------
    (
        "vander_meer_back_to_back_nh",
        "RECORDS_FEATS",
        "In June 1938, this Reds left-hander threw MLB's only back-to-back no-hitters - the second spoiling Ebbets Field's very first night game.",
        "Johnny Vander Meer",
        "Bucky Walters",
        "Paul Derringer",
        "Carl Hubbell",
        "He blanked the Boston Bees on June 11 and the Brooklyn Dodgers four days later on June 15.",
        "Any pitcher hoping to break his record would have to throw three consecutive no-hitters.",
        "Johnny Vander Meer's consecutive no-hitters on June 11 and June 15, 1938, remain one of baseball's safest unbreakable records.",
        -75,
    ),
    (
        "tatis_two_grand_slams_inning",
        "RECORDS_FEATS",
        "On April 23, 1999, at Dodger Stadium, this Cardinals third baseman hit TWO grand slams in the exact same 3rd inning off Chan Ho Park.",
        "Fernando Tatis",
        "Mark McGwire",
        "Ray Lankford",
        "Edgar Renteria",
        "His 8 RBIs in one inning also shattered the Major League record.",
        "His son later became an All-Star shortstop and right fielder for the San Diego Padres.",
        "Fernando Tatis Sr. stands alone in MLB history as the only player to hit two grand slams in a single inning.",
        -95,
    ),
    (
        "kerry_wood_20_so_1998",
        "RECORDS_FEATS",
        "In just his fifth MLB start on May 6, 1998, this 20-year-old Cubs phenom fanned 20 Astros in a one-hitter that earned a record 105 Game Score.",
        "Kerry Wood",
        "Mark Prior",
        "Carlos Zambrano",
        "Greg Maddux",
        "Only a scorching third-inning infield single off Kevin Orie's glove separated him from a no-hitter.",
        "He struck out future Hall of Famers Craig Biggio and Jeff Bagwell repeatedly in the Wrigley rain.",
        "Kerry Wood's 20-strikeout, zero-walk, one-hit gem against Houston is widely ranked the most dominant single nine-inning start ever pitched.",
        -85,
    ),
    (
        "clemens_20_so_1986",
        "RECORDS_FEATS",
        "Blowing fastballs past Seattle on April 29, 1986, this Red Sox righty became the first pitcher to strike out 20 batters in a nine-inning MLB game.",
        "Roger Clemens",
        "Nolan Ryan",
        "Randy Johnson",
        "Dwight Gooden",
        "A full decade later in September 1996, he repeated the 20-strikeout nine-inning feat against Detroit.",
        "Known as 'The Rocket', he won seven Cy Young Awards across 24 MLB seasons.",
        "Roger Clemens broke the nine-inning strikeout record of 19 in 1986 and remains the only pitcher to log two 20-K nine-inning games.",
        -90,
    ),
    (
        "harvey_haddix_12_perfect",
        "RECORDS_FEATS",
        "On May 26, 1959, this Pirates left-hander retired 36 consecutive Milwaukee Braves across 12 perfect innings - yet LOST the game 1-0 in the 13th.",
        "Harvey Haddix",
        "Vern Law",
        "Bob Friend",
        "Roy Face",
        "Felix Mantilla reached on a 13th-inning error before Joe Adcock's hit brought home the lone run.",
        "Opposing starter Lew Burdette scattered 12 hits across 13 shutout innings to win the duel.",
        "Harvey Haddix's 12 consecutive perfect innings in a losing effort stand as the cruelest masterpiece in baseball history.",
        -55,
    ),
    (
        "galarraga_28_out_game",
        "RECORDS_FEATS",
        "On June 2, 2010, this Tigers right-hander threw a famous '28-out imperfect game' after umpire Jim Joyce mistakenly called Jason Donald safe on out 27.",
        "Armando Galarraga",
        "Justin Verlander",
        "Max Scherzer",
        "Rick Porcello",
        "The next day, he graciously brought Detroit's lineup card to home plate to embrace a tearful Joyce.",
        "The blown call became a major catalyst for expanding MLB instant replay review in 2014.",
        "Armando Galarraga retired 26 straight Indians, saw out 27 missed at first base, and immediately retired Trevor Crowe for out 28.",
        -85,
    ),
    (
        "jim_abbott_no_hitter_1993",
        "RECORDS_FEATS",
        "Born without a right hand and shifting his glove smoothly after every pitch, this left-hander threw a 4-0 no-hitter for the Yankees in September 1993.",
        "Jim Abbott",
        "David Cone",
        "Jimmy Key",
        "Andy Pettitte",
        "He had earlier won gold with Team USA at the 1988 Seoul Olympics and placed third in 1991 Cy Young voting.",
        "His no-hitter came against a loaded Cleveland lineup featuring Kenny Lofton, Carlos Baerga, and Albert Belle.",
        "Jim Abbott pitched 10 MLB seasons and authored one of baseball's most inspiring afternoons with his September 4, 1993 no-hitter.",
        -100,
    ),
    (
        "dock_ellis_no_hitter_1970",
        "RECORDS_FEATS",
        "Despite issuing eight walks and plunking a batter on June 12, 1970, this colorful Pirates right-hander blanked the Padres 2-0 for an improbable no-hitter.",
        "Dock Ellis",
        "Steve Blass",
        "Bob Moose",
        "Nelson Briles",
        "He later helped Pittsburgh win the 1971 World Series and started that summer's All-Star Game.",
        "Teammate Matty Alou made a diving catch on a line drive to preserve the gem in San Diego.",
        "Dock Ellis recorded one of MLB's wildest no-hitters in 1970 before going on to win 138 career games across 12 seasons.",
        -30,
    ),
    (
        "hack_wilson_191_rbi",
        "RECORDS_FEATS",
        "Standing just 5-foot-6 with a barrel chest, this Cubs slugger drove in an unbreakable MLB single-season record 191 runs in 1930.",
        "Hack Wilson",
        "Chuck Klein",
        "Rogers Hornsby",
        "Mel Ott",
        "He also belted 56 homers that season - the National League record for 68 years until 1998.",
        "Initially credited with 190 RBIs, a 1999 MLB historical review restored a missing run to make it 191.",
        "Lewis 'Hack' Wilson's 191 RBIs in 1930 still sit seven ahead of Lou Gehrig's AL-record 185 from 1931.",
        -55,
    ),
    (
        "hugh_duffy_440_avg",
        "RECORDS_FEATS",
        "Banging out 237 hits for the 1894 Boston Beaneaters, this outfielder posted a .440 batting average - the highest single-season mark in MLB history.",
        "Hugh Duffy",
        "Tip O'Neill",
        "Nap Lajoie",
        "Willie Keeler",
        "He won the National League Batting Triple Crown that season by also leading with 18 homers and 145 RBIs.",
        "The previous year MLB had moved the pitching distance back from 50 feet to 60 feet 6 inches.",
        "Hugh Duffy's .440 average in 1894 remains MLB's all-time single-season standard, earning him Cooperstown induction in 1945.",
        25,
    ),
    (
        "old_hoss_radbourn_59_wins",
        "RECORDS_FEATS",
        "Pitching 678.2 innings and starting nearly every stretch-run game for the 1884 Providence Grays, this ironman set the MLB single-season record with 59 wins.",
        "Old Hoss Radbourn",
        "Pud Galvin",
        "Tim Keefe",
        "John Clarkson",
        "He completed 73 of his 73 starts that year and swept all three games of the 1884 postseason championship.",
        "He also won the NL Pitching Triple Crown with a 1.38 ERA and 441 strikeouts.",
        "Charles 'Old Hoss' Radbourn's 59 victories in 1884 (some older sources cite 60) stand as baseball's most astonishing workload feat.",
        10,
    ),
    (
        "jack_chesbro_41_wins",
        "RECORDS_FEATS",
        "Relying heavily on his freshly mastered spitball for the 1904 New York Highlanders, this righty won 41 games - the post-1900 MLB single-season record.",
        "Jack Chesbro",
        "Ed Walsh",
        "Christy Mathewson",
        "Walter Johnson",
        "Cruelly, his wild pitch in the 9th inning of the season finale handed Boston the 1904 AL pennant.",
        "He completed 48 of his 51 starts that year across 454.2 innings.",
        "Happy Jack Chesbro's 41 victories in 1904 remain the modern-era standard that no pitcher has approached in over a century.",
        15,
    ),
    (
        "denny_mclain_31_wins",
        "RECORDS_FEATS",
        "Going 31-6 for the 1968 Detroit Tigers while playing organ in lounges on off-nights, he remains Major League Baseball's last 30-game winner.",
        "Denny McLain",
        "Bob Gibson",
        "Luis Tiant",
        "Mickey Lolich",
        "He captured both the AL Cy Young and AL MVP Awards in 1968 before winning a second Cy Young in 1969.",
        "No MLB pitcher has reached even 28 victories in a season since his 31-win campaign.",
        "Denny McLain became the first AL 30-game winner since Lefty Grove (1931) and almost certainly the final 30-game winner in baseball history.",
        -75,
    ),
    (
        "eric_gagne_84_saves",
        "RECORDS_FEATS",
        "Entering Dodger Stadium to 'Welcome to the Jungle', this bespectacled closer converted an MLB-record 84 consecutive save opportunities from 2002 to 2004.",
        "Eric Gagne",
        "Trevor Hoffman",
        "Mariano Rivera",
        "John Smoltz",
        "He went a flawless 55-for-55 in saves with a 1.20 ERA to capture the 2003 NL Cy Young Award.",
        "He became the first relief pitcher since Dennis Eckersley in 1992 to win a Cy Young.",
        "Canadian right-hander Eric Gagne paired a 99-mph fastball with a paralyzing Vulcan changeup during his 84-save perfection streak.",
        -60,
    ),
    (
        "krod_62_saves_2008",
        "RECORDS_FEATS",
        "Nicknamed 'K-Rod' after exploding onto the scene as a 20-year-old rookie in 2002, this Angels closer set MLB's single-season record with 62 saves in 2008.",
        "Francisco Rodriguez",
        "Bobby Thigpen",
        "Edwin Diaz",
        "Craig Kimbrel",
        "He broke Bobby Thigpen's 18-year-old record of 57 saves set with the 1990 White Sox.",
        "He finished his MLB career with 437 saves, fourth-most in Major League history.",
        "Francisco Rodriguez notched save number 62 on September 24, 2008, establishing a single-season saves mark that still stands.",
        -50,
    ),
    (
        "joe_sewell_114_so",
        "RECORDS_FEATS",
        "Using the exact same 40-ounce hickory bat for his entire 14-year Hall of Fame career, this infielder struck out only 114 times in 7,132 MLB at-bats.",
        "Joe Sewell",
        "Nellie Fox",
        "Lloyd Waner",
        "Willie Keeler",
        "He struck out just THREE times across 503 at-bats in 1932 and four times in 1925 and 1929.",
        "He stepped into Cleveland's shortstop job in 1920 right after Ray Chapman's tragic fatality.",
        "Joe Sewell's ratio of 62.6 at-bats per strikeout is unmatched in live-ball baseball history.",
        30,
    ),
    (
        "reggie_jackson_2597_so",
        "RECORDS_FEATS",
        "Even though he belted 563 home runs on his way to Cooperstown, this slugger STILL holds the all-time MLB career record for batter strikeouts at 2,597.",
        "Reggie Jackson",
        "Jim Thome",
        "Adam Dunn",
        "Sammy Sosa",
        "He struck out 100 or more times in 18 different seasons while swinging from his heels.",
        "Second-place Jim Thome finished 49 strikeouts behind him with 2,548.",
        "Reggie Jackson's all-or-nothing swing produced both 563 homers and MLB's all-time record 2,597 strikeouts.",
        -10,
    ),
    (
        "shawn_green_19_total_bases",
        "RECORDS_FEATS",
        "Going 6-for-6 with four home runs, a double, and a single in Milwaukee on May 23, 2002, this Dodgers slugger set an MLB single-game record with 19 total bases.",
        "Shawn Green",
        "Carlos Delgado",
        "Mike Cameron",
        "Mark Whiten",
        "He surpassed Joe Adcock's 48-year-old record of 18 total bases set in 1954.",
        "He followed up with three more homers over the next two days to tie a seven-homer three-game mark.",
        "Shawn Green's 19-total-base explosion at Miller Park remains the greatest single-game offensive output in MLB history.",
        -5,
    ),
    (
        "mark_whiten_4_hr_12_rbi",
        "RECORDS_FEATS",
        "In the nightcap of a September 7, 1993 doubleheader in Cincinnati, this Cardinals outfielder hammered four home runs and tied Jim Bottomley's record of 12 RBIs.",
        "Mark Whiten",
        "Ray Lankford",
        "Todd Zeile",
        "Gregg Jefferies",
        "Nicknamed 'Hard Hittin'', he opened with a 1st-inning grand slam before adding three more blasts.",
        "He became just the 12th player in Major League history to hit four homers in one game.",
        "Mark Whiten drove in 12 of St. Louis's 15 runs on September 7, 1993, matching the single-game RBI mark set in 1924.",
        40,
    ),
    (
        "bill_wambsganss_utp_1920",
        "RECORDS_FEATS",
        "Snaring Clarence Mitchell's liner, stepping on second, and tagging Otto Miller in 1920 Game 5, this Cleveland second baseman turned the ONLY unassisted triple play in World Series history.",
        "Bill Wambsganss",
        "Nap Lajoie",
        "Frankie Frisch",
        "Eddie Collins",
        "In that same 1920 Game 5, teammate Elmer Smith also hit the first World Series grand slam!",
        "Cleveland went on to defeat Brooklyn 5 games to 2 for its first world championship.",
        "Bill Wambsganss executed three outs in seconds on October 10, 1920 - a Fall Classic defensive feat never duplicated.",
        15,
    ),
    (
        "eric_bruntlett_walkoff_utp",
        "RECORDS_FEATS",
        "In August 2009 at Citi Field, this Phillies utility infielder turned just the second game-ending unassisted triple play in MLB history to stun the Mets.",
        "Eric Bruntlett",
        "Chase Utley",
        "Jimmy Rollins",
        "Pedro Feliz",
        "Jeff Francoeur's line drive with runners moving on a hit-and-run handed him all three 9th-inning outs.",
        "Ironically, he had committed two errors earlier in that very same 9th inning!",
        "Eric Bruntlett joined 1927 Tigers first baseman Johnny Neun as the only players ever to end a game with an unassisted triple play.",
        45,
    ),
    (
        "babe_herman_three_on_third",
        "RECORDS_FEATS",
        "In a famous 1926 comedy of errors at Ebbets Field, this Brooklyn outfielder 'doubled into a double play' that left THREE Dodgers standing on third base at once.",
        "Babe Herman",
        "Zack Wheat",
        "Dazzy Vance",
        "Casey Stengel",
        "Dazzy Vance retreated to third while Chick Fewster and the batter both sprinted into the same bag.",
        "Despite his zany baserunning reputation, he actually hit .393 with 35 homers in 1930.",
        "Babe Herman's August 15, 1926 double-into-double-play became the defining symbol of Brooklyn's lovable 'Daffiness Boys' era.",
        35,
    ),
    (
        "fred_merkle_boner_1908",
        "RECORDS_FEATS",
        "Running straight to the clubhouse instead of touching second base on a seemingly game-winning 9th-inning hit in September 1908 cost the Giants the pennant and haunted which rookie?",
        "Fred Merkle",
        "Fred Snodgrass",
        "Larry Doyle",
        "Christy Mathewson",
        "Cubs second baseman Johnny Evers alerted umpires to force him out at second, nullifying the winning run.",
        "Chicago went on to win the resulting makeup game and the 1908 World Series.",
        "At just 19 years old, Fred Merkle suffered baseball's most notorious baserunning lapse, unfairly nicknamed 'Merkle's Boner'.",
        -10,
    ),
    (
        "fred_snodgrass_muff_1912",
        "RECORDS_FEATS",
        "Dropping Clyde Engle's routine fly ball to open the bottom of the 10th in 1912 World Series Game 8 saddled which Giants outfielder with an infamous 'Muff'?",
        "Fred Snodgrass",
        "Red Murray",
        "Josh Devore",
        "Chief Meyers",
        "He actually made a brilliant running catch on the very next batter before Tris Speaker sparked Boston's win.",
        "The Red Sox rallied for two runs off Christy Mathewson to capture the 1912 championship.",
        "Fred Snodgrass's 10th-inning drop at Fenway Park became known as the '$30,000 Muff' and haunted his obituary decades later.",
        50,
    ),
    (
        "canseco_40_40_1988",
        "RECORDS_FEATS",
        "Publicly predicting the feat during spring training, this Oakland Bash Brother inaugurated MLB's 40-40 club in 1988 with 42 home runs and 40 steals.",
        "Jose Canseco",
        "Mark McGwire",
        "Rickey Henderson",
        "Eric Davis",
        "He swept all 28 first-place votes to win unanimous 1988 AL MVP honors.",
        "Only Barry Bonds, Alex Rodriguez, Alfonso Soriano, Ronald Acuna Jr., and Shohei Ohtani joined him.",
        "Jose Canseco delivered on his bold 1988 prediction, inventing one of baseball's most coveted power-speed clubs.",
        -70,
    ),
    (
        "acuna_40_70_2023",
        "RECORDS_FEATS",
        "Combining 41 home runs with an MLB-leading 73 stolen bases in 2023, this Braves star created the 40-70 club and won unanimous NL MVP.",
        "Ronald Acuna Jr.",
        "Mookie Betts",
        "Shohei Ohtani",
        "Elly De La Cruz",
        "Taking advantage of MLB's newly enlarged 18-inch bases, he also scored 149 runs.",
        "He ripped base number 70 right out of the dirt in celebration in Atlanta.",
        "Ronald Acuna Jr. shattered the power-speed ceiling in 2023 by pairing 41 homers with 73 steals and a .337 batting average.",
        -90,
    ),
    (
        "roger_maris_61_1961",
        "RECORDS_FEATS",
        "Swinging under intense media pressure as teammate Mickey Mantle chased beside him, this Yankees outfielder hit 61 homers in 1961 off Tracy Stallard.",
        "Roger Maris",
        "Mickey Mantle",
        "Harmon Killebrew",
        "Rocky Colavito",
        "Because 1961 was the AL's first 162-game schedule, Commissioner Ford Frick proposed a separate notation.",
        "He won consecutive AL MVP Awards in 1960 and 1961 before helping St. Louis win the 1967 title.",
        "Roger Maris connected on October 1, 1961, surpassing Babe Ruth's 60-homer mark and holding the AL record for 61 years until Aaron Judge.",
        -110,
    ),
    (
        "mcgwire_sosa_1998",
        "RECORDS_FEATS",
        "Captivating America throughout the summer of 1998, Mark McGwire (70 HR) and which Cubs rival (66 HR) both shattered Roger Maris's 37-year-old home run mark?",
        "Sammy Sosa",
        "Ken Griffey Jr.",
        "Barry Bonds",
        "Albert Belle",
        "He blasted an MLB-record 20 home runs in the month of June 1998 alone.",
        "He won the 1998 NL MVP Award and later became the only player with three 60-homer seasons.",
        "Sammy Sosa finished with 66 homers and 158 RBIs in 1998 during baseball's unforgettable home run chase with Mark McGwire.",
        -120,
    ),
    (
        "bonds_intentional_walk_bases_loaded",
        "RECORDS_FEATS",
        "In May 1998, Diamondbacks manager Buck Showalter stunned baseball by ordering an intentional walk WITH THE BASES LOADED to which fearsome hitter?",
        "Barry Bonds",
        "Mark McGwire",
        "Ken Griffey Jr.",
        "Albert Pujols",
        "The gamble actually worked: Arizona won 8-7 after Brent Mayne lined out to end the 9th.",
        "He drew a record 688 career intentional walks - more than twice second-place Albert Pujols.",
        "Buck Showalter's bases-loaded pass to Barry Bonds paid off in 1998 and underscored Bonds's unmatched intimidation at the plate.",
        -60,
    ),
    (
        "maury_wills_104_sb_1962",
        "RECORDS_FEATS",
        "Reviving the running game after decades of station-to-station slugging, this Dodgers shortstop swiped 104 bases in 1962 to break Ty Cobb's modern record of 96.",
        "Maury Wills",
        "Lou Brock",
        "Luis Aparicio",
        "Willie Davis",
        "He narrowly edged Willie Mays to win the 1962 NL MVP Award.",
        "He became MLB's first player in the modern era to steal 100 bases in a season.",
        "Maury Wills transformed 1960s offensive strategy by swiping 104 bags in 1962, paving the way for Lou Brock and Rickey Henderson.",
        -25,
    ),
    (
        "vince_coleman_3_100_sb",
        "RECORDS_FEATS",
        "Racing across Busch Stadium's artificial turf from 1985 to 1987, this Cardinals speedster became the only player to steal 100+ bases in each of his first three seasons.",
        "Vince Coleman",
        "Willie McGee",
        "Tim Raines",
        "Rickey Henderson",
        "He stole 110 bases as a 1985 rookie before an automated tarpaulin roller sidelined him in the NLCS.",
        "He led the National League in steals for six straight seasons from 1985 through 1990.",
        "Vince Coleman tallied 110, 107, and 109 stolen bases in his first three campaigns for Whitey Herzog's Cardinals.",
        0,
    ),
    (
        "eddie_gaedel_1_8",
        "RECORDS_FEATS",
        "Sent up to pinch-hit by maverick owner Bill Veeck on August 19, 1951, wearing uniform number 1/8, this 3-foot-7 St. Louis Brown walked on four straight pitches.",
        "Eddie Gaedel",
        "Herb Washington",
        "Minnie Minoso",
        "Satchel Paige",
        "Tigers pitcher Bob Cain threw four high pitches above a strike zone barely two inches tall.",
        "American League President Will Harridge voided his contract the very next day.",
        "Eddie Gaedel made one of sports' most famous stunt appearances in 1951, finishing his MLB career with a spotless 1.000 on-base percentage.",
        -70,
    ),
    (
        "campaneris_all_9_positions",
        "RECORDS_FEATS",
        "On September 8, 1965, for the Kansas City Athletics, this Cuban shortstop became the first player in MLB history to play all nine fielding positions in one game.",
        "Bert Campaneris",
        "Cesar Tovar",
        "Jose Oquendo",
        "Pete Rose",
        "He even pitched ambidextrously in the 8th inning before a home-plate collision ended his night in the 9th.",
        "He later anchored shortstop for Oakland's three straight World Series teams from 1972 to 1974.",
        "Dagoberto 'Bert' Campaneris pioneered the nine-position game in 1965, a stunt matched by only four other players since.",
        -15,
    ),
    (
        "pat_venditte_switch_pitcher",
        "RECORDS_FEATS",
        "Wearing a custom six-finger glove to pitch with both arms, this reliever inspired a 2015 MLB rule requiring switch-pitchers to declare their throwing arm before switch-hitters choose a box.",
        "Pat Venditte",
        "Greg Harris",
        "Jim Abbott",
        "R.A. Dickey",
        "In a famous 2008 minor-league farce, he and switch-hitter Ralph Henriquez switched sides repeatedly for minutes.",
        "He debuted in the majors for the Oakland Athletics in June 2015.",
        "The 'Pat Venditte Rule' codified switch-pitcher vs. switch-hitter matchups after Venditte reached MLB throwing both right- and left-handed.",
        -5,
    ),
    (
        "randy_johnson_bird_2001",
        "RECORDS_FEATS",
        "During a March 2001 spring training game in Tucson, a 100-mph fastball from which Hall of Fame pitcher famously collided mid-air with a passing mourning dove?",
        "Randy Johnson",
        "Nolan Ryan",
        "Aroldis Chapman",
        "Roger Clemens",
        "In a burst of feathers, the pitch was officially ruled 'no pitch' by umpires.",
        "He later paid tongue-in-cheek tribute to the moment in the logo of his professional photography business.",
        "Randy Johnson's surreal March 24, 2001 collision with a flying bird against the Giants remains baseball's ultimate one-in-a-million highlight.",
        -115,
    ),
    (
        "david_cone_yogi_berra_day",
        "RECORDS_FEATS",
        "Throwing just 88 pitches on Yogi Berra Day in July 1999 - with Don Larsen throwing out the ceremonial first pitch - which Yankees righty hurled a perfect game?",
        "David Cone",
        "David Wells",
        "Roger Clemens",
        "Orlando Hernandez",
        "It unfolded against the Montreal Expos right after a 33-minute mid-game rain delay.",
        "Five years earlier he had won the 1994 AL Cy Young Award with Kansas City.",
        "With Don Larsen and Yogi Berra both in attendance on July 18, 1999, David Cone retired all 27 Expos in just 88 pitches.",
        -35,
    ),
    (
        "felix_hernandez_kings_court",
        "RECORDS_FEATS",
        "Cheered by yellow-shirted 'King's Court' fans waving 'K' cards in Seattle, this Venezuelan right-hander threw the Mariners' lone perfect game in August 2012.",
        "Felix Hernandez",
        "Randy Johnson",
        "Hisashi Iwakuma",
        "Jamie Moyer",
        "He struck out 12 Tampa Bay Rays in a 1-0 thriller at Safeco Field.",
        "He had won the 2010 AL Cy Young Award despite going just 13-12 thanks to a league-best 2.27 ERA.",
        "Felix Hernandez ('King Felix') pitched his entire 15-year MLB career in Seattle and authored MLB's 23rd perfect game on August 15, 2012.",
        -60,
    ),
    (
        "domingo_german_2023_pg",
        "RECORDS_FEATS",
        "Retiring all 27 Oakland Athletics in June 2023 on 99 pitches, this Yankees starter threw MLB's 24th perfect game - the first in nearly 11 years.",
        "Domingo German",
        "Gerrit Cole",
        "Nestor Cortes",
        "Luis Severino",
        "He became the first Dominican-born pitcher ever to throw a Major League perfect game.",
        "It was the fourth perfect game in New York Yankees franchise history.",
        "Domingo German ended MLB's longest perfect-game drought since 2012 with an 11-0 victory at the Oakland Coliseum on June 28, 2023.",
        -10,
    ),
    (
        "addie_joss_74_pitches",
        "RECORDS_FEATS",
        "Outdueling Ed Walsh 1-0 on October 2, 1908, this Cleveland ace threw MLB's most efficient perfect game ever using just 74 pitches.",
        "Addie Joss",
        "Cy Young",
        "Walter Johnson",
        "Chief Bender",
        "He owns the second-lowest career ERA in Major League history at 1.89 behind Walsh's 1.82.",
        "Tragically dying of meningitis at age 31, he received a special Hall of Fame nine-year career waiver.",
        "Addie Joss needed only 74 pitches to blank the White Sox in the heat of the 1908 AL pennant race.",
        50,
    ),
    (
        "jim_bunning_senator_pg",
        "RECORDS_FEATS",
        "Tossing the modern National League's first perfect game on Father's Day 1964 against the Mets, this Phillies Hall of Famer later served as a U.S. Senator from Kentucky.",
        "Jim Bunning",
        "Robin Roberts",
        "Chris Short",
        "Don Drysdale",
        "He had earlier thrown an American League no-hitter for Detroit in 1958, becoming the second pitcher to do it in both leagues.",
        "Father of nine children, he struck out 10 Mets in the 6-0 gem at Shea Stadium.",
        "Jim Bunning pitched both an AL no-hitter and a Father's Day 1964 NL perfect game before a 24-year career in the U.S. Congress.",
        10,
    ),
    (
        "catfish_hunter_pg_3_rbi",
        "RECORDS_FEATS",
        "Throwing a May 1968 perfect game for Oakland against Minnesota, this future Hall of Famer also supplied nearly all the offense by going 3-for-4 with three RBIs!",
        "Catfish Hunter",
        "Vida Blue",
        "Blue Moon Odom",
        "Ken Holtzman",
        "Harmon Killebrew struck out looking on a 3-2 pitch to end the 4-0 Oakland triumph.",
        "Owner Charles Finley famously invented his folksy fishing nickname when signing him in 1964.",
        "Jim 'Catfish' Hunter dominated on both sides of the ball on May 8, 1968, and later became MLB's first mega-contract free agent in 1975.",
        15,
    ),
    (
        "matt_cain_14_so_pg",
        "RECORDS_FEATS",
        "Striking out 14 Houston Astros in June 2012 - tying Sandy Koufax's perfect-game strikeout mark - which Giants starter pitched San Francisco's first perfect game?",
        "Matt Cain",
        "Tim Lincecum",
        "Madison Bumgarner",
        "Barry Zito",
        "Gregor Blanco preserved the 7th inning with a jaw-dropping diving catch on the right-center warning track.",
        "He threw 125 pitches in the 10-0 gem during San Francisco's 2012 championship season.",
        "Matt Cain retired all 27 Astros on June 13, 2012, tying Koufax's 1965 strikeout record for a perfect game.",
        -25,
    ),
    (
        "ruth_ernie_shore_1917",
        "RECORDS_FEATS",
        "After Babe Ruth walked the opening batter in June 1917 and was ejected for punching the umpire, which Red Sox reliever retired 26 straight batters after a caught stealing?",
        "Ernie Shore",
        "Dutch Leonard",
        "Carl Mays",
        "Smoky Joe Wood",
        "Ray Morgan was thrown out trying to steal second, so zero batters reached base against the reliever.",
        "MLB once listed it as a perfect game before reclassifying it in 1991 as a combined no-hitter.",
        "Ernie Shore stepped in cold after Babe Ruth's furious 1st-inning ejection on June 23, 1917, and retired all 26 Washington batters he faced.",
        35,
    ),
    (
        "pawtucket_33_innings_1981",
        "RECORDS_FEATS",
        "Spanning 33 innings and 8 hours 25 minutes across Easter weekend 1981 in Pawtucket, baseball's longest pro game featured future Hall of Famers Wade Boggs and whom?",
        "Cal Ripken Jr.",
        "Tony Gwynn",
        "Ryne Sandberg",
        "Kirby Puckett",
        "Suspended at 4:07 a.m. after 32 innings tied 2-2, the contest resumed two months later in June.",
        "Dave Koza finally drove in the winning run in the bottom of the 33rd for Pawtucket over Rochester.",
        "The 1981 Pawtucket-Rochester 33-inning marathon saw future Cooperstown icons Wade Boggs (Pawtucket) and Cal Ripken Jr. (Rochester) play into dawn.",
        10,
    ),
    (
        "cadore_oeschger_26_innings",
        "RECORDS_FEATS",
        "In MLB's longest game by innings on May 1, 1920, Brooklyn's Leon Cadore and Boston's Joe Oeschger BOTH pitched every single inning of a 1-1 darkness tie lasting how many frames?",
        "26",
        "22",
        "24",
        "29",
        "Astonishingly, the marathon at Braves Field took only 3 hours and 50 minutes to play!",
        "Neither pitcher allowed a run after the 6th inning across 20 straight scoreless frames.",
        "Leon Cadore and Joe Oeschger each threw 26 complete innings on May 1, 1920, a stamina record modern baseball will never approach.",
        20,
    ),
    (
        "moneyball_20_streak_2002",
        "RECORDS_FEATS",
        "Immortalized in 'Moneyball', the 2002 Oakland A's captured an AL-record 20th straight win after blowing an 11-0 lead when which converted catcher hit a 9th-inning walk-off homer?",
        "Scott Hatteberg",
        "Eric Chavez",
        "Miguel Tejada",
        "David Justice",
        "Kansas City had stormed back from 11-0 down to tie the game 11-11 in the 9th inning.",
        "General manager Billy Beane had recruited him specifically for his elite on-base eye.",
        "Scott Hatteberg's September 4, 2002 pinch-hit blast gave Oakland its 20th consecutive win and became the emotional climax of 'Moneyball'.",
        -75,
    ),
    (
        "indians_22_streak_2017",
        "RECORDS_FEATS",
        "Surpassing the 2002 'Moneyball' A's on Jay Bruce's walk-off double in September 2017, which club set the American League record with 22 consecutive victories?",
        "Cleveland Indians",
        "Houston Astros",
        "New York Yankees",
        "Boston Red Sox",
        "During the 22-game surge, they outscored opponents 142-37 behind Francisco Lindor and Corey Kluber.",
        "It was MLB's longest winning streak without a tie since the 1916 New York Giants won 26 straight.",
        "Terry Francona's 2017 Cleveland club won 22 straight games from August 24 to September 14, establishing the modern AL record.",
        -55,
    ),
    (
        "mariners_cubs_116_wins",
        "RECORDS_FEATS",
        "Sharing Major League Baseball's all-time single-season record of 116 regular-season wins, the 1906 Chicago Cubs and 2001 Seattle Mariners ALSO share what painful distinction?",
        "Neither won the World Series",
        "Neither had a 20-game winner",
        "Neither led their league in homers",
        "Neither had an MVP award winner",
        "Chicago lost the 1906 Crosstown Classic to the 'Hitless Wonders' White Sox, while Seattle fell in the ALCS.",
        "The 2001 Mariners lost 4-1 to the Yankees despite Ichiro Suzuki's historic MVP rookie season.",
        "Both 116-win juggernauts fell short of a championship, underscoring the unpredictability of October baseball.",
        -70,
    ),
    (
        "white_sox_121_losses_2024",
        "RECORDS_FEATS",
        "Finishing 41-121 in September 2024, this American League club broke the 1962 New York Mets' modern record for the most losses in a single MLB season.",
        "Chicago White Sox",
        "Oakland Athletics",
        "Colorado Rockies",
        "Detroit Tigers",
        "They endured a 21-game midseason losing streak that tied the American League mark.",
        "Only the 1899 Cleveland Spiders (20-134) lost more games in all of Major League history.",
        "The 2024 Chicago White Sox eclipsed the expansion 1962 Mets' 120 defeats, finishing 41-121 despite Garrett Crochet's breakout season.",
        -95,
    ),
    (
        "arraez_3_teams_batting_titles",
        "RECORDS_FEATS",
        "Winning batting crowns with Minnesota (2022), Miami (2023), and San Diego (2024), this contact maestro became the only player to win three straight batting titles for three different clubs.",
        "Luis Arraez",
        "Freddie Freeman",
        "Steven Kwan",
        "Bobby Witt Jr.",
        "Known for a microscopic strikeout rate, he posted averages of .316, .354, and .314 across those three years.",
        "He also became the first player to win batting titles in both leagues in consecutive seasons.",
        "Luis Arraez's unmatched bat-to-ball precision produced three straight batting crowns across three franchises from 2022 to 2024.",
        -60,
    ),
    (
        "ohtani_sept19_2024_miami",
        "RECORDS_FEATS",
        "To burst past the 50-50 threshold on September 19, 2024, in Miami, Shohei Ohtani authored MLB's first-ever 6-for-6 game featuring how many homers and RBIs?",
        "3 home runs and 10 RBIs",
        "4 home runs and 8 RBIs",
        "2 home runs and 9 RBIs",
        "3 home runs and 7 RBIs",
        "He also added two doubles and two stolen bases for 17 total bases in the 20-4 rout.",
        "The night pushed his season totals from 48 HR / 49 SB straight to 51 HR / 51 SB.",
        "Shohei Ohtani's 6-for-6, 3-HR, 10-RBI, 2-SB explosion in Miami is hailed as the greatest single-game performance in MLB history.",
        -80,
    ),
    (
        "phillip_humber_2012_pg",
        "RECORDS_FEATS",
        "Despite finishing his career with a 5.31 ERA and just 16 wins, this White Sox right-hander retired all 27 Mariners in April 2012 for baseball's most unlikely perfect game.",
        "Philip Humber",
        "Mark Buehrle",
        "Jake Peavy",
        "Chris Sale",
        "Brendan Ryan checked his swing on strike three before A.J. Pierzynski threw to first for out 27.",
        "He had been selected third overall in the 2004 MLB Draft out of Rice University.",
        "Philip Humber's April 21, 2012 gem in Seattle made him the third White Sox pitcher ever to throw a perfect game.",
        20,
    ),
    (
        "tom_browning_1988_pg",
        "RECORDS_FEATS",
        "After a two-and-a-half-hour rain delay in Cincinnati on September 16, 1988, this Reds lefty threw a 1-0 perfect game against the eventual World Series champion Dodgers.",
        "Tom Browning",
        "Danny Jackson",
        "Jose Rijo",
        "Mario Soto",
        "Nine months earlier he had lost a no-hitter with one out in the 9th against San Diego.",
        "He threw just 102 pitches and later helped Cincinnati sweep the 1990 World Series.",
        "Tom Browning's September 1988 masterpiece remains the only perfect game in Cincinnati Reds franchise history.",
        25,
    ),
    (
        "len_barker_1981_pg",
        "RECORDS_FEATS",
        "Pitching in chilly mist on May 15, 1981, before just 7,290 fans at Cleveland Stadium, this 6-foot-5 right-hander threw a 3-0 perfect game against Toronto.",
        "Len Barker",
        "Bert Blyleven",
        "Dennis Eckersley",
        "Rick Sutcliffe",
        "He did not run a single three-ball count all night while striking out 11 Blue Jays.",
        "Two years later Cleveland traded him to Atlanta in a deal that netted future slugger Brook Jacoby.",
        "Len Barker delivered Cleveland's first perfect game since Addie Joss in 1908 with a dominant 103-pitch outing in 1981.",
        45,
    ),
    (
        "david_wells_1998_pg",
        "RECORDS_FEATS",
        "Throwing a May 17, 1998 perfect game for the Yankees against Minnesota on Beanie Baby Day, this burly lefty had famously worn an authentic game-used Babe Ruth cap earlier that year.",
        "David Wells",
        "Andy Pettitte",
        "David Cone",
        "Kenny Rogers",
        "He retired all 27 Twins in a 4-0 win at Yankee Stadium before Paul O'Neill caught Pat Meares's fly.",
        "He won 239 career games across 21 seasons and captured 1998 ALCS MVP.",
        "David Wells pitched the first regular-season perfect game in Yankees history in 1998 while winning 18 games for the 125-win champions.",
        -45,
    ),
    (
        "gehrig_first_modern_4_hr",
        "RECORDS_FEATS",
        "On June 3, 1932, in Philadelphia, this Yankees slugger became the first 20th-century player to hit four home runs in a game - yet was overshadowed in headlines by John McGraw's retirement.",
        "Lou Gehrig",
        "Babe Ruth",
        "Jimmie Foxx",
        "Chuck Klein",
        "He hit his four blasts consecutively and nearly hit a fifth in the 9th before Al Simmons caught it at the wall.",
        "No player had achieved a four-homer game since Ed Delahanty in 1896.",
        "Lou Gehrig belted four straight home runs at Shibe Park on June 3, 1932, becoming the third player in MLB history to hit four in a game.",
        10,
    ),
    (
        "joe_dimaggio_streak_ended",
        "RECORDS_FEATS",
        "On July 17, 1941, in Cleveland, third baseman Ken Keltner made two dazzling backhand stops to finally end Joe DiMaggio's 56-game streak, yet DiMaggio immediately hit safely in how many straight games next?",
        "16",
        "8",
        "24",
        "12",
        "That meant he hit safely in 72 of 73 consecutive games across May, June, and July 1941!",
        "Al Smith and Jim Bagby Jr. shared pitching duties for Cleveland in the 4-3 night victory.",
        "After Cleveland ended the 56-game streak, Joe DiMaggio opened a fresh 16-game streak the very next afternoon.",
        35,
    ),
    (
        "rose_44_game_streak_1978",
        "RECORDS_FEATS",
        "Tying Willie Keeler's 1897 National League record in 1978, which switch-hitter strung together a 44-game hitting streak - still the longest in MLB since Joe DiMaggio?",
        "Pete Rose",
        "Paul Molitor",
        "Jimmy Rollins",
        "George Sisler",
        "Braves pitchers Larry McWilliams and Gene Garber finally snapped the run in Atlanta on August 1, 1978.",
        "Paul Molitor came closest since with a 39-game streak for Milwaukee in 1987.",
        "Pete Rose's 44-game streak in 1978 stands as the National League modern record and the closest any hitter has come to DiMaggio's 56.",
        -35,
    ),
    (
        "paul_molitor_39_streak_1987",
        "RECORDS_FEATS",
        "Finishing 1987 with a 39-game hitting streak - halted while he stood in the on-deck circle as Rick Manning hit a walk-off single - who was this Brewers Hall of Famer?",
        "Paul Molitor",
        "Robin Yount",
        "Cecil Cooper",
        "Wade Boggs",
        "He batted .353 that year and later batted .500 to win 1993 World Series MVP for Toronto.",
        "Nicknamed 'The Ignitor', he retired with 3,319 career hits.",
        "Paul Molitor's 39-game hitting streak in 1987 remains the longest American League streak since Joe DiMaggio.",
        15,
    ),
    (
        "johnny_vander_skip_use_ohtani_k_trout",
        "RECORDS_FEATS",
        "With two outs in the 9th of the 2023 World Baseball Classic final, Shohei Ohtani threw a sweeping 3-2 slider to strike out which Angels teammate for Japan's third WBC crown?",
        "Mike Trout",
        "Mookie Betts",
        "Paul Goldschmidt",
        "Nolan Arenado",
        "Played at loanDepot park in Miami, the dream matchup featured two unanimous AL MVPs.",
        "Japan went 7-0 in the tournament to defeat Team USA 3-2.",
        "Shohei Ohtani fanned Mike Trout on a devastating 87-mph sweeper to clinch Japan's third World Baseball Classic title in 2023.",
        -115,
    ),
    (
        "nolan_ryan_2795_walks",
        "RECORDS_FEATS",
        "Alongside his untouchable 5,714 strikeouts, Nolan Ryan ALSO holds the all-time MLB career record for walks issued with how many (more than 960 ahead of Steve Carlton)?",
        "2,795",
        "1,842",
        "2,110",
        "3,210",
        "He walked 204 batters in 1977 alone - yet still struck out 341 and won 19 games.",
        "His electric velocity made him simultaneously the hardest pitcher to hit and one of the wildest.",
        "Nolan Ryan issued 2,795 career walks across 5,386 innings, nearly 1,000 more than second-place Steve Carlton's 1,833 walks.",
        30,
    ),
    (
        "ted_williams_482_obp",
        "RECORDS_FEATS",
        "Drawing 2,021 walks while batting .344 lifetime, Ted Williams holds MLB's all-time career record in which core offensive rate stat at .482?",
        "On-base percentage",
        "Slugging percentage",
        "Batting average",
        "Isolated power",
        "Babe Ruth sits right behind him in second place at .474.",
        "He led the American League in this category 12 separate times.",
        "Ted Williams reached base in nearly half of his career plate appearances (.482 OBP), a record unmatched in baseball history.",
        -40,
    ),
    (
        "babe_ruth_690_slg",
        "RECORDS_FEATS",
        "Combining 714 homers, 506 doubles, and 136 triples, Babe Ruth still reigns atop baseball's all-time leaderboards in career OPS (1.164) and what .690 stat?",
        "Slugging percentage",
        "On-base percentage",
        "Batting average on balls in play",
        "Win probability added",
        "Ted Williams (.634) and Lou Gehrig (.632) trail him by more than 55 points.",
        "In 1920 he posted a jaw-dropping .847 single-season mark in this stat.",
        "Babe Ruth's .690 career slugging percentage and 1.164 OPS stand far above every other player in MLB history.",
        -55,
    ),
    (
        "cy_young_315_losses",
        "RECORDS_FEATS",
        "Because he pitched an astonishing 7,356 innings across 22 seasons, Cy Young holds the all-time career record for pitching wins (511) AND what dubious career mark (315)?",
        "Losses",
        "Hit batters",
        "Wild pitches",
        "Balks",
        "Pud Galvin sits second all-time at 308 while Nolan Ryan leads live-ball pitchers at 292.",
        "He also leads MLB history with 815 games started and 749 complete games.",
        "Cy Young's 315 career losses reflect his unrivaled durability over 906 appearances from 1890 to 1911.",
        -60,
    ),
    (
        "barry_bonds_609_obp_2004",
        "RECORDS_FEATS",
        "Walking 232 times (120 intentionally) while batting .362 with 45 homers in 2004, Barry Bonds posted an eye-popping single-season on-base percentage of what?",
        ".609",
        ".525",
        ".553",
        ".488",
        "He reached base safely in more than six out of every ten plate appearances all year!",
        "The mark shattered Ted Williams's 63-year-old single-season record of .553 from 1941.",
        "Barry Bonds's .609 OBP in 2004 broke his own .582 mark from 2002 and stands as one of baseball's most surreal statistical outliers.",
        0,
    ),
    (
        "judge_2022_al_record_team",
        "RECORDS_FEATS",
        "On October 4, 2022, Aaron Judge launched his AL-record 62nd home run of the season at Globe Life Field against which Texas pitcher?",
        "Jesus Tinoco",
        "Martin Perez",
        "Dane Dunning",
        "Jon Gray",
        "The milestone blast sailed into the left-field seats in Arlington during the second game of a doubleheader.",
        "Fan Cory Youmans caught the ball, which later sold at auction for $1.5 million.",
        "Aaron Judge belted homer number 62 off Rangers right-hander Jesus Tinoco to break Roger Maris's 1961 AL record.",
        55,
    ),
    (
        "ken_griffey_sr_jr_1990",
        "RECORDS_FEATS",
        "Playing side by side in the Seattle outfield on September 14, 1990, Ken Griffey Jr. and his father belted back-to-back home runs in Anaheim against which club?",
        "California Angels",
        "Oakland Athletics",
        "Texas Rangers",
        "Kansas City Royals",
        "Pitcher Kirk McCaskill surrendered both 1st-inning drives in Anaheim Stadium.",
        "Weeks earlier they had become the first father-son duo to play simultaneously in an MLB game.",
        "Ken Griffey Sr. and Jr. went back-to-back against the California Angels in September 1990, crafting one of baseball's most joyful highlights.",
        10,
    ),
    (
        "scherzer_20_so_2016",
        "RECORDS_FEATS",
        "Striking out 20 batters in nine innings in May 2016 to tie the MLB record, Max Scherzer dominated which former team of his where he won the 2013 Cy Young?",
        "Detroit Tigers",
        "Arizona Diamondbacks",
        "New York Mets",
        "Los Angeles Dodgers",
        "Pitching for Washington, he threw 119 pitches - 96 of them strikes - in a 3-2 Nationals victory.",
        "James McCann grounded out on the final pitch, denying him a record-breaking 21st strikeout.",
        "Max Scherzer joined Roger Clemens, Kerry Wood, and Randy Johnson as the only pitchers to strike out 20 in nine innings, doing so against Detroit.",
        -15,
    ),
    (
        "randy_johnson_20_so_2001",
        "RECORDS_FEATS",
        "On May 8, 2001, Randy Johnson struck out 20 Cincinnati Reds in nine innings, though MLB omits it from the nine-inning record list because the game went to how many innings?",
        "11",
        "10",
        "12",
        "14",
        "The score was tied 1-1 after nine frames before Arizona finally won 4-3.",
        "He remains the only left-handed pitcher ever to strike out 20 batters across nine innings.",
        "Randy Johnson fanned 20 Reds in his nine frames of work in 2001, yet MLB's official nine-inning list excludes extra-inning games.",
        25,
    ),
    (
        "tom_seaver_10_straight_so",
        "RECORDS_FEATS",
        "On April 22, 1970, at Shea Stadium, Tom Seaver tied the nine-inning strikeout record (19) by finishing the game with an MLB-record 10 straight strikeouts against which team?",
        "San Diego Padres",
        "Montreal Expos",
        "Philadelphia Phillies",
        "Chicago Cubs",
        "Aaron Nola (2021) and Corbin Burnes (2021) finally tied his 10-consecutive-strikeout mark 51 years later.",
        "Every single Padre from the final out of the 6th through the 9th inning went down swinging or looking.",
        "Tom Seaver fanned the final 10 Padres in a row in April 1970, a consecutive-strikeout record that stood alone for 51 seasons.",
        30,
    ),
    (
        "carl_hubbell_1934_asg",
        "RECORDS_FEATS",
        "Spinning his signature screwball at the 1934 All-Star Game at the Polo Grounds, this Giants lefty struck out Ruth, Gehrig, Foxx, Simmons, and Cronin in a row!",
        "Carl Hubbell",
        "Dizzy Dean",
        "Lefty Gomez",
        "Van Lingle Mungo",
        "All five consecutive strikeout victims went on to become Hall of Famers.",
        "Nicknamed 'King Carl' and 'The Meal Ticket', he won two NL MVPs and 253 career games.",
        "Carl Hubbell's five straight strikeouts of Murderers' Row and AL legends in 1934 remain the signature pitching moment in All-Star Game history.",
        -15,
    ),
    (
        "pedro_1999_asg_fenway",
        "RECORDS_FEATS",
        "Electrifying his home Fenway Park crowd at the 1999 All-Star Game, Pedro Martinez struck out five of the first six NL hitters - including Larkin, Walker, Sosa, and whom?",
        "Mark McGwire",
        "Ken Griffey Jr.",
        "Chipper Jones",
        "Vladimir Guerrero",
        "After Jeff Bagwell struck out to open the 2nd inning, Matt Williams reached on an error before being caught stealing.",
        "He earned All-Star Game MVP honors after fanning five Hall of Fame-caliber sluggers in two frames.",
        "Pedro Martinez's 1999 All-Star opening (fanning Larkin, Walker, Sosa, McGwire, and Bagwell) echoed Carl Hubbell's 1934 magic.",
        -25,
    ),
    (
        "cal_ripken_1995_hr_night",
        "RECORDS_FEATS",
        "On the unforgettable September 6, 1995 night he broke Lou Gehrig's streak in game 2,131, Cal Ripken Jr. punctuated the celebration by doing what in the 4th inning?",
        "Hitting a home run",
        "Stealing home plate",
        "Turning a triple play",
        "Hitting for the cycle",
        "President Bill Clinton and Joe DiMaggio were in the Camden Yards stands as banners dropped.",
        "Following the 5th inning when the game became official, he received a 22-minute standing ovation.",
        "Cal Ripken Jr. smashed a 4th-inning home run off Angels pitcher Shawn Boskie on his record-breaking 2,131st straight game.",
        -40,
    ),
    (
        "aaron_715_al_downing",
        "RECORDS_FEATS",
        "On April 8, 1974, in Atlanta, Hank Aaron launched career home run number 715 into the Braves' left-field bullpen off which Dodgers left-handed pitcher?",
        "Al Downing",
        "Don Sutton",
        "Tommy John",
        "Andy Messersmith",
        "Reliever Tom House caught the historic ball inside the bullpen and sprinted it to home plate.",
        "Vin Scully told viewers: 'A Black man is getting a standing ovation in the Deep South for breaking a record of an all-time baseball idol.'",
        "Hank Aaron took Dodgers lefty Al Downing deep in the 4th inning on April 8, 1974, to surpass Babe Ruth's 714.",
        -5,
    ),
    (
        "cobb_4189_vs_rose_4256",
        "RECORDS_FEATS",
        "On September 11, 1985, Pete Rose lined a single to left-center at Riverfront Stadium for career hit 4,192 off which San Diego Padres pitcher?",
        "Eric Show",
        "Goose Gossage",
        "Ed Whitson",
        "Andy Hawkins",
        "After the hit broke Ty Cobb's 57-year mark, Rose embraced his son Pete Jr. near first base.",
        "Later historical revisions adjusted Cobb's official hit count to 4,189.",
        "Pete Rose passed Ty Cobb with hit number 4,192 off Padres right-hander Eric Show before finishing his career at 4,256.",
        30,
    ),
    (
        "mookie_betts_3_ws_rings",
        "RECORDS_FEATS",
        "In 2018 with Boston, this electric five-tool outfielder became the first AL player ever to win MVP, Silver Slugger, Gold Glove, a batting title, and a World Series in one season.",
        "Mookie Betts",
        "Aaron Judge",
        "Jose Altuve",
        "Mike Trout",
        "He batted .346 with 32 homers and 30 steals in 2018 before winning additional titles with the Dodgers.",
        "Outside baseball, he has bowled multiple certified 300 perfect games in PBA events.",
        "Mookie Betts swept every major individual and team prize in 2018 and later captured 2020 and 2024 titles in Los Angeles.",
        -75,
    ),
    (
        "elly_de_la_cruz_cycle_2023",
        "RECORDS_FEATS",
        "Just 15 games into his electrifying rookie call-up in June 2023, this 6-foot-5 Reds switch-hitting phenom hit for the cycle against Atlanta.",
        "Elly De La Cruz",
        "Corbin Carroll",
        "Gunnar Henderson",
        "Bobby Witt Jr.",
        "Weeks later he stole second, third, and home on the same Brewers pitching sequence.",
        "Statcast clocked his infield throws at nearly 100 mph alongside MLB's fastest sprint speed.",
        "At age 21 in June 2023, Elly De La Cruz became the youngest MLB player in 51 years to hit for the cycle.",
        -50,
    ),
    (
        "ohtani_unanimous_mvps",
        "RECORDS_FEATS",
        "Before Shohei Ohtani won three unanimous MVP Awards (2021, 2023, 2024), how many other players in MLB history had EVER won even TWO unanimous MVPs?",
        "Zero",
        "One",
        "Two",
        "Three",
        "Even Babe Ruth, Willie Mays, Barry Bonds, and Mike Trout won at most one unanimous MVP.",
        "He became the first player ever to capture multiple unanimous MVP trophies in 2023, then added a third in 2024.",
        "No player prior to Shohei Ohtani had ever won two unanimous MVP Awards; Ohtani swept all first-place votes in 2021, 2023, and 2024.",
        -35,
    ),
    (
        "bobby_witt_jr_30_30_2024",
        "RECORDS_FEATS",
        "Leading MLB with a .332 batting average while posting consecutive 30-homer, 30-steal seasons in 2023 and 2024, this Royals star became the first shortstop with multiple 30-30 campaigns.",
        "Bobby Witt Jr.",
        "Gunnar Henderson",
        "Francisco Lindor",
        "Corey Seager",
        "He finished runner-up to Aaron Judge in 2024 AL MVP voting while guiding Kansas City back to October.",
        "Drafted second overall in 2019, his father pitched 16 MLB seasons.",
        "Bobby Witt Jr. paired a .332 batting title with 32 homers, 31 steals, and Gold Glove shortstop defense in 2024.",
        -45,
    ),
    (
        "paul_skenes_2024_asg_starter",
        "RECORDS_FEATS",
        "Selected first overall out of LSU in 2023, this Pirates flamethrower became just the fifth rookie ever to start an MLB All-Star Game in 2024 before winning NL Rookie of the Year.",
        "Paul Skenes",
        "Jackson Merrill",
        "Shota Imanaga",
        "Jared Jones",
        "He followed up his 1.96-ERA rookie brilliance by capturing the 2025 NL Cy Young Award.",
        "His signature 'splinker' blends sinker movement with splitter drop at over 94 mph.",
        "Paul Skenes joined Hideo Nomo and Fernando Valenzuela among rookie All-Star starters in 2024 and won 2024 NL ROY.",
        -70,
    ),
    (
        "aaron_judge_2017_52_rookie_hr",
        "RECORDS_FEATS",
        "Smashing 52 home runs in 2017 to break Mark McGwire's 30-year-old rookie record (until Pete Alonso hit 53 in 2019), who unanimously won 2017 AL Rookie of the Year?",
        "Aaron Judge",
        "Cody Bellinger",
        "Rafael Devers",
        "Andrew Benintendi",
        "He also captivated Miami by winning the 2017 Home Run Derby with 500-foot blasts.",
        "He later set the AL single-season home run record with 62 in 2022.",
        "Aaron Judge hit 52 homers as a 2017 rookie to shatter McGwire's 49-homer mark from 1987.",
        -80,
    ),
    (
        "pete_alonso_53_rookie_hr",
        "RECORDS_FEATS",
        "Nicknamed 'Polar Bear', this Mets first baseman hit 53 home runs in 2019 to set MLB's all-time rookie single-season home run record.",
        "Pete Alonso",
        "Yordan Alvarez",
        "Fernando Tatis Jr.",
        "Vladimir Guerrero Jr.",
        "He topped Aaron Judge's 52-homer rookie mark by one and also won the 2019 and 2021 Home Run Derbies.",
        "He hit a dramatic go-ahead 9th-inning homer off Devin Williams in the 2024 NL Wild Card Series.",
        "Pete Alonso blasted 53 homers in 2019 to win NL Rookie of the Year and set the rookie home run benchmark.",
        -75,
    ),
    (
        "ricketts_skip_use_derek_jeter_3000_hr",
        "RECORDS_FEATS",
        "Going 5-for-5 on July 9, 2011, against Tampa Bay, Derek Jeter became just the second player (after Wade Boggs) to reach 3,000 career hits by doing what?",
        "Hitting a home run",
        "Hitting a triple",
        "Beating out a bunt single",
        "Hitting a walk-off double",
        "He took Rays lefty David Price deep into the left-field seats at Yankee Stadium.",
        "Fan Christian Lopez famously returned the milestone ball without asking for money.",
        "Derek Jeter homered off David Price for hit 3,000 and later drove in the winning run in the 8th for a storybook 5-for-5 afternoon.",
        -60,
    ),
    (
        "miguel_cabrera_3000_500_club",
        "RECORDS_FEATS",
        "When Miguel Cabrera reached 3,000 hits in April 2022, he became just the seventh member of baseball's 500-HR / 3,000-hit club alongside Aaron, Mays, Murray, Palmeiro, Pujols, and whom?",
        "Alex Rodriguez",
        "Ken Griffey Jr.",
        "Barry Bonds",
        "Babe Ruth",
        "Note that Babe Ruth finished with 2,873 hits and Barry Bonds finished with 2,935 hits.",
        "This three-time AL MVP finished with 696 home runs and 3,115 career hits.",
        "Only Hank Aaron, Willie Mays, Eddie Murray, Rafael Palmeiro, Alex Rodriguez, Albert Pujols, and Miguel Cabrera reached both 500 HR and 3,000 hits.",
        -20,
    ),
    (
        "rickey_henderson_130_sb",
        "RECORDS_FEATS",
        "Swiping an astounding 130 stolen bases in 1982 for Billy Martin's Oakland A's, Rickey Henderson broke whose modern record of 118 steals from 1974?",
        "Lou Brock",
        "Maury Wills",
        "Ty Cobb",
        "Tim Raines",
        "The Cardinals Hall of Famer had held both the single-season (118) and career (938) stolen base marks.",
        "Henderson went on to break his career mark too in May 1991.",
        "Lou Brock set the modern single-season mark of 118 steals in 1974 before Rickey Henderson raised the bar to 130 in 1982.",
        -35,
    ),
    (
        "nolan_ryan_robin_ventura",
        "RECORDS_FEATS",
        "On August 4, 1993, at age 46, Rangers icon Nolan Ryan famously placed which 26-year-old White Sox third baseman in a headlock after a mound charge?",
        "Robin Ventura",
        "Frank Thomas",
        "Ozzie Guillen",
        "Albert Belle",
        "Ryan stayed in the game after the brawl while the charging batter was ejected!",
        "The batter actually went on to win six Gold Gloves and manage the White Sox.",
        "The August 1993 Ryan-Ventura mound clash became one of the most replayed fiery moments in Texas Rangers history.",
        -95,
    ),
    (
        "bob_gibson_17_so_1968",
        "RECORDS_FEATS",
        "Striking out 17 Detroit Tigers in Game 1 of the 1968 World Series, Bob Gibson broke Sandy Koufax's Fall Classic single-game record of how many strikeouts?",
        "15",
        "14",
        "13",
        "16",
        "Koufax had set the previous mark against the Yankees in Game 1 of the 1963 World Series.",
        "Gibson struck out Al Kaline, Norm Cash, and Willie Horton in the 9th to finish the 4-0 shutout.",
        "Bob Gibson fanned 17 Tigers in 1968 Game 1, passing Sandy Koufax's 15 from 1963 for a World Series record that still stands.",
        10,
    ),
    (
        "ichiro_2001_mvp_roy",
        "RECORDS_FEATS",
        "Before Ichiro Suzuki swept both AL MVP and Rookie of the Year in 2001, who was the ONLY other player in MLB history to win both awards in the same season (1975)?",
        "Fred Lynn",
        "Cal Ripken Jr.",
        "Fernando Valenzuela",
        "Jose Canseco",
        "Playing center field for Boston, he batted .331 with 21 homers, 47 doubles, and 105 RBIs as a rookie.",
        "He later hit the first grand slam in MLB All-Star Game history in 1983.",
        "Red Sox center fielder Fred Lynn (1975) and Mariners star Ichiro Suzuki (2001) remain the sole players to win Rookie of the Year and MVP together.",
        -15,
    ),
    (
        "clemente_12_gold_gloves",
        "RECORDS_FEATS",
        "Roberto Clemente and Willie Mays are tied atop MLB's all-time leaderboard for outfielders with how many career Gold Glove Awards apiece?",
        "12",
        "10",
        "14",
        "11",
        "Ken Griffey Jr., Al Kaline, and Ichiro Suzuki each finished two behind them with 10.",
        "Clemente won his 12 straight from 1961 through his final season in 1972.",
        "Willie Mays and Roberto Clemente each earned 12 Gold Gloves, the most ever won by outfielders.",
        5,
    ),
    (
        "johnny_bench_10_gg_ties_pudge",
        "RECORDS_FEATS",
        "Before Ivan Rodriguez passed him with 13, which Cincinnati Reds legend held the MLB record for catchers with 10 consecutive Gold Glove Awards?",
        "Johnny Bench",
        "Yadier Molina",
        "Gary Carter",
        "Bob Boone",
        "He won every NL catching Gold Glove from his 1968 Rookie of the Year season through 1977.",
        "Yadier Molina later won nine Gold Gloves in St. Louis.",
        "Johnny Bench won 10 straight Gold Gloves (1968-1977) while powering the Big Red Machine.",
        -35,
    ),

    # -------------------------------------------------------------------------
    # THEME 4: DIAMOND_CULTURE (75 bespoke entries)
    # -------------------------------------------------------------------------
    (
        "fenway_green_monster",
        "DIAMOND_CULTURE",
        "Towering 37 feet 2 inches high just 310 feet down Boston's left-field line, what iconic ballpark landmark gained atop-the-wall seats in 2003?",
        "The Green Monster",
        "Pesky's Pole",
        "Tal's Hill",
        "The Ivy Wall",
        "Before 1947 it was covered in advertisements rather than its signature dark green paint.",
        "Its manual tin-plate scoreboard still contains Morse code initials of former owners Tom and Jean Yawkey.",
        "Fenway Park's 37-foot-2-inch Green Monster is baseball's most recognizable outfield wall, standing since 1912.",
        -135,
    ),
    (
        "fenway_lone_red_seat",
        "DIAMOND_CULTURE",
        "Standing out amidst green bleachers in Fenway Park's Section 42, Row 37, Seat 21, a single red seat marks whose 502-foot home run from June 1946?",
        "Ted Williams",
        "Jimmie Foxx",
        "Carl Yastrzemski",
        "David Ortiz",
        "The mammoth blast actually struck straw-hatted fan Joseph Boucher squarely on the head!",
        "It remains the longest officially measured home run ever hit inside Fenway Park.",
        "Fenway Park's Lone Red Seat commemorates Ted Williams's legendary 502-foot blast off Fred Hutchinson on June 9, 1946.",
        -70,
    ),
    (
        "wrigley_ivy_bill_veeck",
        "DIAMOND_CULTURE",
        "In 1937, future maverick owner Bill Veeck planted Boston ivy along the brick outfield walls of which classic National League ballpark?",
        "Wrigley Field",
        "Fenway Park",
        "Ebbets Field",
        "Forbes Field",
        "It was also the very last Major League stadium to install permanent lights, in August 1988.",
        "Its hand-operated 1937 center-field scoreboard has never been struck by a fair batted ball.",
        "Bill Veeck convinced Cubs owner P.K. Wrigley to plant ivy along Wrigley Field's freshly rebuilt brick walls in September 1937.",
        -125,
    ),
    (
        "camden_yards_1992_retro",
        "DIAMOND_CULTURE",
        "Opening in April 1992 with the towering red-brick B&O Warehouse looming beyond right field, this Baltimore stadium sparked MLB's retro-classic ballpark renaissance.",
        "Oriole Park at Camden Yards",
        "Jacobs Field",
        "Coors Field",
        "PNC Park",
        "Designed by HOK Sport, it reversed three decades of sterile concrete multipurpose 'cookie-cutter' stadiums.",
        "Ken Griffey Jr. is the only batter ever to hit the B&O Warehouse on the fly (during the 1993 Home Run Derby).",
        "Oriole Park at Camden Yards transformed modern stadium architecture when it opened in downtown Baltimore in 1992.",
        -110,
    ),
    (
        "astrodome_astroturf_1965",
        "DIAMOND_CULTURE",
        "Hailed as the 'Eighth Wonder of the World' in 1965, MLB's first indoor domed stadium prompted the invention of AstroTurf after painted roof panels killed the natural grass.",
        "Astrodome",
        "Kingdome",
        "Metrodome",
        "Tropicana Field",
        "Fielders lost fly balls in the bright Lucite skylight glare, forcing operators to paint the dome white.",
        "Mickey Mantle hit the building's very first home run in an April 1965 exhibition game.",
        "Houston's Astrodome debuted synthetic ChemGrass - swiftly renamed AstroTurf - in 1966 after its painted ceiling killed the Bermuda turf.",
        -115,
    ),
    (
        "coors_field_humidor",
        "DIAMOND_CULTURE",
        "Sitting 5,200 feet above sea level with a purple upper-deck row marking exactly one mile high, this ballpark installed a climate-controlled humidor for baseballs in 2002.",
        "Coors Field",
        "Chase Field",
        "Globe Life Field",
        "Kauffman Stadium",
        "Dry mile-high air had turned baseballs into hard, lively golf-ball-like rockets during the late 1990s.",
        "Storing balls at 70 degrees and 50% humidity brought scoring back toward league norms.",
        "Colorado's Coors Field pioneered MLB's baseball humidor in 2002; by 2022, MLB mandated humidors in all 30 stadiums.",
        -105,
    ),
    (
        "oracle_park_mccovey_cove",
        "DIAMOND_CULTURE",
        "Kayakers bobbing in San Francisco Bay wait for left-handed 'Splash Hits' sailing over the 24-foot brick right-field wall of Oracle Park into what famously named waterway?",
        "McCovey Cove",
        "Mays Bay",
        "Candlestick Reach",
        "Marichal Channel",
        "The brick right-field wall measures 24 feet tall specifically to honor Willie Mays's uniform number.",
        "Barry Bonds accounted for 35 of the first 100 Splash Hits landed on the fly in the water.",
        "Named for Giants Hall of Famer Willie McCovey, McCovey Cove sits just beyond right field of San Francisco's waterfront ballpark.",
        -95,
    ),
    (
        "polo_grounds_483_center",
        "DIAMOND_CULTURE",
        "Shaped like a giant bathtub with cozy foul lines (279 ft left, 258 ft right) yet a cavernous 483-foot dead center field, what legendary Manhattan ballpark hosted the Giants and early Mets?",
        "Polo Grounds",
        "Ebbets Field",
        "Hilltop Park",
        "Baker Bowl",
        "Willie Mays's 1954 catch and Bobby Thomson's 1951 'Shot Heard 'Round the World' both unfolded there.",
        "Its twin-tower center-field clubhouse sat across the Harlem River directly opposite Yankee Stadium.",
        "The Polo Grounds' bizarre horseshoe dimensions produced both cheap foul-pole homers and Willie Mays's immortal 420-foot catch.",
        -95,
    ),
    (
        "ebbets_field_hit_sign",
        "DIAMOND_CULTURE",
        "Beneath the 38-foot right-field wall of Brooklyn's Ebbets Field stood clothier Abe Stark's famous bottom-of-the-wall sign offering what prize to any batter who hit it on the fly?",
        "A free suit",
        "A new car",
        "Lifetime box seats",
        "A case of beer",
        "Because Carl Furillo stood right in front of the low three-foot sign, virtually nobody ever hit it on the fly!",
        "The cheeky sign read simply: 'Hit Sign, Win Suit.'",
        "Abe Stark's 'Hit Sign, Win Suit' advertisement at the base of Ebbets Field's right-field wall became a beloved symbol of Brooklyn baseball.",
        -35,
    ),
    (
        "rickwood_field_oldest_park",
        "DIAMOND_CULTURE",
        "Opening in 1910 in Birmingham, Alabama, as home of the Black Barons where teenage Willie Mays starred, what is the oldest surviving professional ballpark in the United States?",
        "Rickwood Field",
        "Bosse Field",
        "Hinchliffe Stadium",
        "Fenway Park",
        "MLB staged a special regular-season Cardinals-vs-Giants Negro Leagues tribute game there in June 2024.",
        "Built two years before Fenway Park, it was modeled partly after Pittsburgh's Forbes Field.",
        "Birmingham's Rickwood Field hosted the Negro Leagues' Birmingham Black Barons and remains America's oldest standing pro ballpark.",
        -50,
    ),
    (
        "field_of_dreams_2021",
        "DIAMOND_CULTURE",
        "Emerging through towering Iowa cornstalks in August 2021, the Chicago White Sox beat the Yankees 9-8 on Tim Anderson's walk-off homer in the first MLB game at which movie site?",
        "Dyersville, Iowa",
        "Cedar Rapids, Iowa",
        "Cooperstown, New York",
        "Williamsport, Pennsylvania",
        "Kevin Costner walked out of the cornfield before first pitch just as in his 1989 film 'Field of Dreams'.",
        "Eight home runs flew into the cornstalks during the most-watched regular-season MLB broadcast in 16 years.",
        "MLB built a temporary 8,000-seat stadium beside the 1989 'Field of Dreams' movie diamond in Dyersville, Iowa.",
        -85,
    ),
    (
        "take_me_out_to_ballgame",
        "DIAMOND_CULTURE",
        "Composed in 1908 by Jack Norworth and Albert Von Tilzer - NEITHER of whom had ever attended a baseball game - what song became baseball's unofficial 7th-inning stretch anthem?",
        "Take Me Out to the Ball Game",
        "Talkin' Baseball",
        "Centerfield",
        "Tess",
        "The original verses actually tell the story of a baseball-loving woman named Katie Casey!",
        "Norworth scribbled the lyrics on a New York subway train after spotting a Polo Grounds sign.",
        "Neither Jack Norworth nor Albert Von Tilzer visited a ballpark until decades after writing 'Take Me Out to the Ball Game' in 1908.",
        -135,
    ),
    (
        "casey_at_the_bat_1888",
        "DIAMOND_CULTURE",
        "'There is no joy in Mudville' closes what famous 1888 Ernest Lawrence Thayer ballad about a cocky slugger who watches two strikes and swings through a third?",
        "Casey at the Bat",
        "Baseball's Sad Lexicon",
        "The Natural",
        "Tinker to Evers to Chance",
        "First published in the San Francisco Examiner, actor DeWolf Hopper recited it over 10,000 times on stage.",
        "Teammates Flynn and Blake sit on second and third when the mighty slugger steps to the plate.",
        "Ernest Lawrence Thayer's 1888 poem 'Casey at the Bat' remains the most famous piece of sports verse in American literature.",
        -125,
    ),
    (
        "whos_on_first_abbott_costello",
        "DIAMOND_CULTURE",
        "Enshrined on a continuous loop inside the National Baseball Hall of Fame, what classic 1938 Abbott and Costello comedy sketch plays on absurd infielder names?",
        "Who's on First?",
        "Casey at the Bat",
        "The Natural",
        "Slide, Kelly, Slide",
        "Second base belongs to 'What', third base to 'I Don't Know', and shortstop to 'I Don't Give a Darn'.",
        "Time magazine named it the greatest comedy routine of the 20th century.",
        "Bud Abbott and Lou Costello's rapid-fire 'Who's on First?' routine earned a permanent exhibit in Cooperstown in 1956.",
        -135,
    ),
    (
        "vin_scully_67_seasons",
        "DIAMOND_CULTURE",
        "Opening games with 'It's time for Dodger baseball!' from 1950 in Brooklyn through 2016 in Los Angeles, who broadcasted 67 seasons for one club - the longest run in pro sports?",
        "Vin Scully",
        "Red Barber",
        "Mel Allen",
        "Jack Buck",
        "He called Don Larsen's perfect game, Hank Aaron's 715th homer, Bill Buckner's error, and Kirk Gibson's blast.",
        "His poetic solo broadcasts won him the Ford C. Frick Award and the Presidential Medal of Freedom.",
        "Vin Scully narrated 67 consecutive seasons of Dodgers baseball (1950-2016), setting the gold standard for sports storytelling.",
        -115,
    ),
    (
        "harry_caray_holy_cow",
        "DIAMOND_CULTURE",
        "Wearing oversized thick-rimmed glasses and leading Wrigley Field's 7th-inning stretch with 'Holy Cow!', who was the exuberant voice of the Cardinals, White Sox, and Cubs?",
        "Harry Caray",
        "Jack Brickhouse",
        "Ernie Harwell",
        "Bob Uecker",
        "He broadcast MLB games for 53 straight seasons from 1945 until 1997.",
        "Will Ferrell famously parodied his enthusiastic space-and-hot-dog tangents on Saturday Night Live.",
        "Harry Caray became a national TV icon on WGN superstation broadcasts from Wrigley Field, earning the 1989 Ford C. Frick Award.",
        -115,
    ),
    (
        "ernie_harwell_traded_for_catcher",
        "DIAMOND_CULTURE",
        "In 1948, Branch Rickey traded minor-league catcher Cliff Dapper to Atlanta in the ONLY MLB player-for-broadcaster swap ever, acquiring which future Tigers radio legend?",
        "Ernie Harwell",
        "Red Barber",
        "Mel Allen",
        "Vin Scully",
        "He went on to call Detroit Tigers baseball for 42 seasons with signatures like 'Long gone!' and 'He stood there like the house by the side of the road.'",
        "He was inducted into the broadcasters' wing of Cooperstown in 1981.",
        "Brooklyn acquired Ernie Harwell from the minor-league Atlanta Crackers for catcher Cliff Dapper in 1948 before Harwell became Detroit's voice.",
        20,
    ),
    (
        "bob_uecker_mr_baseball",
        "DIAMOND_CULTURE",
        "Batting a self-deprecating .200 as a backup catcher before calling Brewers games for 54 seasons and playing Harry Doyle in 'Major League', who was 'Mr. Baseball'?",
        "Bob Uecker",
        "Joe Garagiola",
        "Tim McCarver",
        "Harry Caray",
        "Johnny Carson coined his 'Mr. Baseball' nickname across more than 100 Tonight Show appearances.",
        "His movie line 'Juuuust a bit outside!' became universal ballpark slang for wild pitches.",
        "Bob Uecker charmed fans for over five decades as Milwaukee's beloved broadcaster and comedy icon, winning the 2003 Frick Award.",
        -110,
    ),
    (
        "red_barber_first_tv_1939",
        "DIAMOND_CULTURE",
        "Coining phrases like 'sittin' in the catbird seat' and 'tearing up the pea patch', which Dodgers voice called MLB's very first televised game at Ebbets Field in August 1939?",
        "Red Barber",
        "Mel Allen",
        "Vin Scully",
        "Russ Hodges",
        "NBC broadcast the Reds-Dodgers doubleheader on experimental station W2XBS using just two cameras.",
        "He later mentored young Vin Scully in the Brooklyn radio booth.",
        "Walter 'Red' Barber pioneered Southern-inflected baseball play-by-play and narrated MLB's inaugural telecast on August 26, 1939.",
        10,
    ),
    (
        "curt_flood_reserve_clause",
        "DIAMOND_CULTURE",
        "Declaring 'a well-paid slave is nonetheless a slave' after refusing a 1969 trade from St. Louis to Philadelphia, which Gold Glove center fielder challenged MLB's reserve clause at the Supreme Court?",
        "Curt Flood",
        "Andy Messersmith",
        "Catfish Hunter",
        "Marvin Miller",
        "Though he lost Flood v. Kuhn 5-3 in 1972, his sacrifice directly paved the road to player free agency.",
        "He had won seven straight Gold Gloves and two World Series rings with the Cardinals.",
        "Curt Flood sacrificed his playing career to take MLB's reserve clause to the U.S. Supreme Court, inspiring modern player rights.",
        -75,
    ),
    (
        "marvin_miller_mlbpa",
        "DIAMOND_CULTURE",
        "Leading the MLB Players Association from 1966 to 1982, this former Steelworkers economist negotiated baseball's first collective bargaining agreement, salary arbitration, and free agency.",
        "Marvin Miller",
        "Donald Fehr",
        "Peter Seitz",
        "Bowie Kuhn",
        "Under his leadership, the average MLB salary rose from $19,000 in 1966 to over $240,000 by 1982.",
        "After decades of near-misses, he was finally elected to the Hall of Fame in 2020.",
        "Marvin Miller transformed the MLBPA into the strongest union in sports and ended the century-old perpetual reserve clause.",
        -45,
    ),
    (
        "seitz_decision_1975",
        "DIAMOND_CULTURE",
        "In December 1975, arbitrator Peter Seitz struck down MLB's perpetual reserve clause by declaring Dave McNally and which Dodgers pitcher free agents after playing out their option year?",
        "Andy Messersmith",
        "Don Sutton",
        "Tommy John",
        "Catfish Hunter",
        "MLB owners fired Seitz immediately after the ruling, yet the free-agency era had irreversibly begun.",
        "He signed with Ted Turner's Atlanta Braves in April 1976 and briefly wore 'CHANNEL' above number 17.",
        "Arbitrator Peter Seitz's landmark 1975 ruling in favor of Andy Messersmith and Dave McNally launched modern Major League free agency.",
        30,
    ),
    (
        "branch_rickey_farm_system",
        "DIAMOND_CULTURE",
        "Besides signing Jackie Robinson in Brooklyn, what visionary executive invented baseball's modern minor-league farm system while running the St. Louis Cardinals in the 1920s?",
        "Branch Rickey",
        "Larry MacPhail",
        "Bill Veeck",
        "George Weiss",
        "He also championed batting helmets and hired statistician Allan Roth - an early forerunner of analytics.",
        "Nicknamed 'The Mahatma', he quipped 'Luck is the residue of design.'",
        "Branch Rickey revolutionized MLB twice: first by creating St. Louis's farm system, then by integrating baseball with Jackie Robinson.",
        -85,
    ),
    (
        "bill_veeck_disco_demolition",
        "DIAMOND_CULTURE",
        "Besides signing Larry Doby and Eddie Gaedel, this eccentric White Sox owner built the exploding scoreboard and oversaw 1979's infamous 'Disco Demolition Night' forfeit.",
        "Bill Veeck",
        "Charles Finley",
        "George Steinbrenner",
        "Marge Schott",
        "After radio DJ Steve Dahl blew up crates of disco records in center field, fans rioted and ruined the Comiskey turf.",
        "He also introduced players' last names on the backs of MLB jerseys in 1960.",
        "Bill Veeck was baseball's ultimate showman-owner, innovating promotions and fan experience from Cleveland to Chicago.",
        -60,
    ),
    (
        "charles_finley_colorful_as",
        "DIAMOND_CULTURE",
        "Dressing his 1970s Oakland champions in Kelly green and gold with white cleats - and even employing track star Herb Washington purely as a pinch runner - who was the A's maverick owner?",
        "Charles Finley",
        "Bill Veeck",
        "Walter O'Malley",
        "Ted Turner",
        "He lobbied relentlessly for the designated hitter, night World Series games, and bright orange baseballs.",
        "He also kept a real Missouri mule named 'Charlie O' as the franchise mascot.",
        "Charlie Finley built Oakland's 1972-1974 dynasty and reshaped MLB's look with colorful uniforms and bold rule proposals.",
        -25,
    ),
    (
        "billy_beane_moneyball",
        "DIAMOND_CULTURE",
        "Immortalized in Michael Lewis's 2003 bestseller 'Moneyball', which Oakland A's general manager exploited undervalued on-base percentage to win 103 games on a shoestring payroll?",
        "Billy Beane",
        "Theo Epstein",
        "Sandy Alderson",
        "Andrew Friedman",
        "Brad Pitt portrayed him in the 2011 film alongside Jonah Hill's composite analyst Peter Brand (inspired by Paul DePodesta).",
        "A former 1st-round draft bust himself, he proved scouts often overvalued physical tools over plate discipline.",
        "Billy Beane and assistant Paul DePodesta sparked MLB's data-analytics revolution with the 2002 Oakland Athletics.",
        -120,
    ),
    (
        "bill_james_sabermetrics",
        "DIAMOND_CULTURE",
        "Writing self-published 'Baseball Abstracts' while working nights as a pork-and-beans cannery guard in Kansas, who coined the term 'sabermetrics'?",
        "Bill James",
        "Earnshaw Cook",
        "Henry Chadwick",
        "Nate Silver",
        "He named the discipline after SABR - the Society for American Baseball Research.",
        "Boston hired him as a senior advisor in 2002, helping guide the Red Sox to four World Series rings.",
        "Bill James invented runs created, Game Score, and Pythagorean win expectation, launching modern baseball analytics.",
        -85,
    ),
    (
        "theo_epstein_curse_breaker",
        "DIAMOND_CULTURE",
        "Hired by Boston at age 28 as the youngest GM in MLB history, this executive became baseball's ultimate curse-breaker by ending BOTH the Red Sox's 86-year and Cubs' 108-year droughts.",
        "Theo Epstein",
        "Billy Beane",
        "Brian Cashman",
        "Dave Dombrowski",
        "Boston snapped its drought in 2004 and added another ring in 2007 before he moved to Wrigley Field in 2011.",
        "Chicago won its first World Series since 1908 in 2016 under his baseball-operations blueprint.",
        "Theo Epstein cemented his legacy as MLB's premier modern team-builder by dismantling baseball's two most famous championship curses.",
        -105,
    ),
    (
        "connie_mack_50_years_suit",
        "DIAMOND_CULTURE",
        "Directing fielders by waving a scorecard from the dugout in a crisp business suit and straw hat, who managed the Philadelphia Athletics for 50 seasons with a record 3,731 wins?",
        "Connie Mack",
        "John McGraw",
        "Casey Stengel",
        "Walter Alston",
        "Because he owned and managed the club through lean rebuilding years, he also holds the record for managerial losses (3,948).",
        "He won five World Series titles and managed until age 87 in 1950.",
        "Cornelius McGillicuddy ('Connie Mack') managed the Athletics from 1901 through 1950, piling up unapproachable managerial records.",
        -90,
    ),
    (
        "john_mcgraw_little_napoleon",
        "DIAMOND_CULTURE",
        "Nicknamed 'Little Napoleon', this fierce New York Giants skipper won 10 NL pennants and pioneered inside baseball's hit-and-run, squeeze bunt, and specialized relief pitching.",
        "John McGraw",
        "Connie Mack",
        "Miller Huggins",
        "Wilbert Robinson",
        "He managed the Giants for 30 seasons (1902-1932) and finished with 2,763 managerial wins.",
        "He won three World Series titles (1905, 1921, 1922) while starring Christy Mathewson and Mel Ott.",
        "John McGraw forged the blueprint for aggressive, tactical baseball management across three decades at the Polo Grounds.",
        -35,
    ),
    (
        "casey_stengel_1962_mets",
        "DIAMOND_CULTURE",
        "After winning seven World Series titles managing the Yankees, 'The Old Perfessor' took over the hapless 40-120 expansion 1962 Mets and famously sighed 'Can't anybody here play this game?'",
        "Casey Stengel",
        "Yogi Berra",
        "Leo Durocher",
        "Gil Hodges",
        "His rambling, witty monologue style became known across America as 'Stengelese'.",
        "As a player, he once tipped his cap at Ebbets Field and let a live sparrow fly out!",
        "Casey Stengel piloted the Yankees to 10 pennants in 12 years before giving the lovable 1962 expansion Mets instant charm.",
        -80,
    ),
    (
        "earl_weaver_three_run_homer",
        "DIAMOND_CULTURE",
        "Tracking batter-pitcher splits on index cards and preaching 'pitching, defense, and the three-run homer', this fiery Orioles manager was ejected 96 times while winning 1,480 MLB contests.",
        "Earl Weaver",
        "Billy Martin",
        "Bobby Cox",
        "Tony La Russa",
        "Standing 5-foot-7, he once kicked dirt over home plate and tore up the rulebook in front of an umpire.",
        "He led Baltimore to four AL pennants and the 1970 World Series championship.",
        "Earl Weaver's disdain for sacrifice bunts and devotion to platoon data anticipated modern sabermetrics by decades.",
        -60,
    ),
    (
        "bobby_cox_162_ejections",
        "DIAMOND_CULTURE",
        "Leading Atlanta to 14 consecutive division crowns and the 1995 title, this fiercely protective manager holds the all-time MLB record with 162 career ejections.",
        "Bobby Cox",
        "Earl Weaver",
        "John McGraw",
        "Lou Piniella",
        "He broke John McGraw's 75-year-old ejection record in August 2007.",
        "He won 2,504 games as a skipper and earned four Manager of the Year awards.",
        "Bobby Cox's 162 ejections reflected his famous habit of rushing out to defend players before they could get tossed themselves.",
        -65,
    ),
    (
        "bruce_bochy_4_rings",
        "DIAMOND_CULTURE",
        "Emerging from retirement in 2023 to guide the Texas Rangers to their first title, this skipper joined an elite group with four World Series rings after winning three in San Francisco.",
        "Bruce Bochy",
        "Joe Torre",
        "Tony La Russa",
        "Terry Francona",
        "He also managed San Diego to the 1998 NL pennant, taking three different franchises to the Fall Classic.",
        "His bullpen mastery in October became legendary across 2010, 2012, 2014, and 2023.",
        "Bruce Bochy became just the sixth manager in MLB history to capture at least four World Series titles.",
        -75,
    ),
    (
        "dh_rule_1973_blomberg",
        "DIAMOND_CULTURE",
        "When the American League introduced the Designated Hitter in April 1973, which Yankees slugger walked against Luis Tiant at Fenway Park to become the first DH ever to bat?",
        "Ron Blomberg",
        "Orlando Cepeda",
        "Tony Oliva",
        "Tommy Davis",
        "He stepped into the box on Opening Day, April 6, 1973, drawing a bases-loaded walk.",
        "The National League resisted the rule for nearly half a century until adopting the universal DH in 2022.",
        "Yankees slugger Ron Blomberg entered the record books on April 6, 1973, as MLB's inaugural Designated Hitter.",
        10,
    ),
    (
        "mound_lowered_1969",
        "DIAMOND_CULTURE",
        "Following 1968's 'Year of the Pitcher' - when AL batting champ Carl Yastrzemski hit just .301 - MLB dropped the pitcher's mound height from 15 inches to how many inches?",
        "10 inches",
        "8 inches",
        "12 inches",
        "6 inches",
        "MLB simultaneously shrank the top of the strike zone from the shoulders down to the armpits.",
        "Scoring immediately jumped by over a full run per game in 1969.",
        "Lowering the mound from 15 to 10 inches in 1969 restored offensive balance after Bob Gibson's 1.12 ERA and 339 MLB shutouts in 1968.",
        -55,
    ),
    (
        "pitch_clock_2023",
        "DIAMOND_CULTURE",
        "In 2023, MLB paired 18-inch bases and shift bans with a pitch timer (15 seconds empty, 20 seconds with runners) that trimmed average nine-inning game times by roughly how much?",
        "24 minutes",
        "6 minutes",
        "45 minutes",
        "11 minutes",
        "Average game duration plunged from 3 hours 4 minutes in 2022 down to 2 hours 40 minutes in 2023.",
        "Meanwhile, stolen bases jumped by more than 40% across the majors.",
        "MLB's 2023 pitch clock slashed 24 minutes off the average game, producing the briskest pace of play since 1985.",
        -50,
    ),
    (
        "infield_fly_rule_1895",
        "DIAMOND_CULTURE",
        "Adopted in 1895 to stop sneaky fielders from intentionally letting shallow pop-ups drop for cheap double plays, what rule automatically calls a batter out with fewer than two outs and runners on first and second?",
        "Infield Fly Rule",
        "Balk Rule",
        "Neighborhood Play",
        "Dropped Third Strike Rule",
        "Umpires invoke it only when an infielder can catch the pop-up with 'ordinary effort'.",
        "Even though the batter is out, baserunners may still advance at their own risk after tagging up.",
        "The Infield Fly Rule protects baserunners forced to stay close to their bags from intentional drops with runners on first and second (or loaded).",
        -115,
    ),
    (
        "mendoza_line_200",
        "DIAMOND_CULTURE",
        "Coined by teammates Tom Paciorek and Bruce Bochte to tease a slick-fielding Pirates and Mariners shortstop, 'The Mendoza Line' refers to which batting average benchmark?",
        ".200",
        ".250",
        ".175",
        ".225",
        "George Brett popularized the phrase nationwide when telling ESPN he checked the paper daily to make sure he stayed above it.",
        "Ironically, Mario Mendoza finished his nine-year MLB career slightly above it at .215!",
        "Named after shortstop Mario Mendoza, the Mendoza Line (.200) became baseball's enduring shorthand for offensive futility.",
        -115,
    ),
    (
        "tommy_john_surgery_1974",
        "DIAMOND_CULTURE",
        "In September 1974, Dodgers orthopedic pioneer Dr. Frank Jobe replaced a torn elbow ligament with a forearm tendon, launching which now-famous career-saving procedure?",
        "Tommy John surgery",
        "Sandy Koufax surgery",
        "Cy Young reconstruction",
        "Rotator cuff graft",
        "The namesake left-hander returned in 1976 and amazingly won 164 MORE MLB games after the operation!",
        "Medically it is known as ulnar collateral ligament (UCL) reconstruction.",
        "Dr. Frank Jobe gave Dodgers pitcher Tommy John a 1-in-100 chance in 1974; the procedure has since saved hundreds of MLB careers.",
        -130,
    ),
    (
        "phil_niekro_knuckleball",
        "DIAMOND_CULTURE",
        "Winning 318 MLB games while pitching until age 48 - including 121 wins after turning 40 - this Braves Hall of Famer mastered which fluttering, nearly spinless pitch?",
        "Knuckleball",
        "Screwball",
        "Splitter",
        "Gyroball",
        "Catcher Bob Uecker joked that the best way to catch it was to 'wait until it stops rolling and pick it up.'",
        "His brother Joe Niekro threw the same pitch, giving the siblings an MLB-record 539 combined wins.",
        "Phil Niekro threw a dancing knuckleball for 24 MLB seasons, logging 5,404 innings and entering Cooperstown in 1997.",
        -95,
    ),
    (
        "ra_dickey_2012_cy_young",
        "DIAMOND_CULTURE",
        "Reinventing his career in his mid-30s after discovering he was born without an ulnar collateral ligament, this Mets righty became the only knuckleballer ever to win a Cy Young Award in 2012.",
        "R.A. Dickey",
        "Tim Wakefield",
        "Charlie Hough",
        "Tom Candiotti",
        "He went 20-6 with 230 strikeouts and back-to-back one-hitters for New York in 2012.",
        "Earlier he had won bronze with Team USA at the 1996 Atlanta Olympics.",
        "R.A. Dickey threw a hard 80-mph knuckleball to claim the 2012 NL Cy Young Award, making pitching history.",
        -60,
    ),
    (
        "eephus_pitch_rip_sewell",
        "DIAMOND_CULTURE",
        "Invented in the 1940s by Pirates pitcher Rip Sewell, what bizarre 55-mph high-arcing rainbow lob did Ted Williams famously crush for a homer in the 1946 All-Star Game?",
        "Eephus pitch",
        "Forkball",
        "Palmball",
        "Slurve",
        "Teammate Maurice Van Robays coined the nonsensical name, explaining 'Eephus ain't nothin', and that's a nothin' pitch.'",
        "Modern pitchers like Zack Greinke and Orlando Hernandez occasionally revived it to freeze stunned hitters.",
        "Rip Sewell's sky-high Eephus pitch baffled 1940s sluggers until Ted Williams timed one at Fenway Park in the 1946 All-Star Game.",
        -35,
    ),
    (
        "immaculate_inning_9_pitches",
        "DIAMOND_CULTURE",
        "Rarer than a no-hitter until recent high-strikeout seasons, what pitching gem occurs when a pitcher strikes out all three batters in a half-inning on exactly nine pitches?",
        "Immaculate inning",
        "Perfect frame",
        "Golden inning",
        "Maddux inning",
        "Every single pitch thrown must be a strike - zero balls and zero foul balls after two strikes.",
        "Sandy Koufax, Chris Sale, and Max Scherzer are among the few pitchers to throw three in a career.",
        "An immaculate inning requires nine consecutive strikes to fan all three batters in a frame, first accomplished by John Clarkson in 1889.",
        -105,
    ),
    (
        "golden_sombrero_4_so",
        "DIAMOND_CULTURE",
        "In colorful baseball dugout slang, a batter who suffers the indignity of striking out four times in a single game is said to wear what headgear?",
        "Golden Sombrero",
        "Silver Crown",
        "Platinum Helmet",
        "Bronze Cap",
        "Five strikeouts in one game upgrades the dubious honor to a Platinum Sombrero.",
        "The term riffed on hockey's 'hat trick' (three strikeouts) with an even bigger brim.",
        "Striking out four times in a single game earns a batter the infamous 'Golden Sombrero' in baseball parlance.",
        -115,
    ),
    (
        "scorecard_6_4_3_dp",
        "DIAMOND_CULTURE",
        "On a traditional baseball scorecard where positions are numbered 1 through 9, a classic '6-4-3 double play' travels in exact sequence from which three positions?",
        "Shortstop to second base to first base",
        "Third base to second base to first base",
        "Pitcher to shortstop to first base",
        "Second base to shortstop to first base",
        "Pitcher is 1, catcher is 2, first base is 3, second base is 4, third base is 5, and shortstop is 6.",
        "A '4-6-3' starts at second base, whereas a '5-4-3' goes around the horn from third.",
        "Because shortstop is scored as 6, second base as 4, and first base as 3, a 6-4-3 double play goes SS-2B-1B.",
        -120,
    ),
    (
        "baseball_108_stitches",
        "DIAMOND_CULTURE",
        "Hand-sewn in Costa Rica from two figure-eight cowhide panels over a cushioned cork center, an official MLB Rawlings baseball features exactly how many double stitches?",
        "108",
        "96",
        "120",
        "88",
        "Coincidentally, it matches the exact number of years the Chicago Cubs waited between World Series titles (1908-2016)!",
        "The red waxed cotton thread creates seams that govern Magnus-force pitch movement.",
        "Every official Major League Baseball is stitched with exactly 108 double stitches of red cotton thread.",
        -90,
    ),
    (
        "lena_blackburne_mud",
        "DIAMOND_CULTURE",
        "Before every MLB game since 1938, clubhouse attendants take the slick shine off brand-new baseballs using Lena Blackburne's secret rubbing mud harvested from which river basin?",
        "Delaware River",
        "Hudson River",
        "Susquehanna River",
        "Ohio River",
        "Former Athletics coach Russell 'Lena' Blackburne discovered the fine silt along a secret New Jersey tributary.",
        "The Bintliff family still guards the exact riverbank location and supplies all 30 MLB teams.",
        "Lena Blackburne Baseball Rubbing Mud from a Delaware River tributary gives MLB pitchers grip without discoloring or softening the cowhide.",
        -55,
    ),
    (
        "louisville_slugger_1884",
        "DIAMOND_CULTURE",
        "In 1884, 17-year-old woodworker Bud Hillerich stayed up late turning a custom ash bat for slumping star Pete Browning, founding what iconic bat brand?",
        "Louisville Slugger",
        "Rawlings Adirondack",
        "Marucci",
        "Victus",
        "Browning went 3-for-3 the very next afternoon, and Honus Wagner signed the first player bat endorsement in 1905.",
        "Its Kentucky museum entrance is marked by a 120-foot hollow steel replica of Babe Ruth's bat.",
        "Hillerich & Bradsby's Louisville Slugger grew from Pete Browning's 1884 custom turn into the most famous bat in baseball history.",
        -110,
    ),
    (
        "rawlings_gold_glove_1957",
        "DIAMOND_CULTURE",
        "First presented by Rawlings in 1957 to honor MLB's premier fielders at every position, which award has been won a record 18 times by pitcher Greg Maddux?",
        "Gold Glove Award",
        "Silver Slugger Award",
        "Fielding Bible Award",
        "Platinum Glove Award",
        "In its inaugural 1957 year, only one team of nine winners was chosen across both leagues combined.",
        "Brooks Robinson and Jim Kaat sit just behind Maddux with 16 trophies apiece.",
        "The Rawlings Gold Glove Award debuted in 1957 and expanded to separate AL and NL winners the very next season.",
        -115,
    ),
    (
        "wbc_japan_3_titles",
        "DIAMOND_CULTURE",
        "Capturing championships in 2006, 2009, and 2023 behind icons like Daisuke Matsuzaka and Shohei Ohtani, which nation holds the most World Baseball Classic titles?",
        "Japan",
        "United States",
        "Dominican Republic",
        "Cuba",
        "Only the Dominican Republic (2013) and the United States (2017) have won the other editions.",
        "Ichiro Suzuki's 10th-inning go-ahead single against South Korea sealed their 2009 repeat.",
        "Samurai Japan leads all nations with three World Baseball Classic championships across the tournament's first five editions.",
        -105,
    ),
    (
        "little_league_williamsport",
        "DIAMOND_CULTURE",
        "Founded by lumber-yard clerk Carl Stotz in 1939, the Little League World Series is staged every August at Lamade Stadium in which Pennsylvania town?",
        "South Williamsport",
        "Cooperstown",
        "Scranton",
        "Hershey",
        "Fans famously slide down the steep grassy hill beyond the outfield fence on flattened cardboard boxes.",
        "In 2017 MLB began playing an annual regular-season Little League Classic nearby at Bowman Field.",
        "South Williamsport, Pennsylvania, has been the spiritual home of Little League Baseball since Carl Stotz created the league in 1939.",
        -95,
    ),
    (
        "abner_doubleday_myth",
        "DIAMOND_CULTURE",
        "In 1907, Albert Spalding's Mills Commission famously - and falsely - credited which Civil War general with inventing baseball in a Cooperstown cow pasture in 1839?",
        "Abner Doubleday",
        "Alexander Cartwright",
        "Henry Chadwick",
        "Ulysses S. Grant",
        "The myth relied on a single shaky letter from aging engineer Abner Graves - yet it put the Hall of Fame in Cooperstown!",
        "Historians showed the general was actually a West Point cadet far from Cooperstown in 1839.",
        "Though the Doubleday origin tale was debunked by historians, it directly inspired Cooperstown's selection for the Hall of Fame in 1939.",
        -90,
    ),
    (
        "alexander_cartwright_1845",
        "DIAMOND_CULTURE",
        "Codifying 90-foot basepaths, three outs per inning, foul lines, and tagging runners instead of pelting them with thrown balls, who helped draft the 1845 Knickerbocker Rules?",
        "Alexander Cartwright",
        "Abner Doubleday",
        "Harry Wright",
        "William Hulbert",
        "He later carried baseball westward across the California Gold Rush and all the way to Hawaii.",
        "He was inducted into Cooperstown in 1938 as a pioneer of modern baseball rules.",
        "Alexander Cartwright and the New York Knickerbockers established the 1845 ruleset that shaped modern diamond play.",
        -45,
    ),
    (
        "red_stockings_1869_undefeated",
        "DIAMOND_CULTURE",
        "Managed by cricket-born Harry Wright on a $9,300 team payroll, which 1869 club became baseball's first openly all-salaried pro team and went an astonishing 57-0?",
        "Cincinnati Red Stockings",
        "Boston Red Stockings",
        "New York Mutuals",
        "Philadelphia Athletics",
        "They toured coast-to-coast by newly completed transcontinental railroad, drawing huge crowds.",
        "Their 81-game overall unbeaten streak finally ended in June 1870 against the Brooklyn Atlantics.",
        "The 1869 Cincinnati Red Stockings proved professional baseball could thrive commercially, paving the way for the National League.",
        -55,
    ),
    (
        "first_all_star_game_1933",
        "DIAMOND_CULTURE",
        "Conceived by Chicago Tribune sports editor Arch Ward as a one-time 'Game of the Century' for the 1933 World's Fair, MLB's inaugural All-Star Game was held at which ballpark?",
        "Comiskey Park",
        "Wrigley Field",
        "Yankee Stadium",
        "Fenway Park",
        "Babe Ruth smashed a two-run homer in the 3rd inning to lift the American League to a 4-2 win.",
        "Fans loved the showcase so much that MLB immediately made the Midsummer Classic an annual tradition.",
        "Comiskey Park hosted the very first MLB All-Star Game on July 6, 1933, with Connie Mack managing the AL and John McGraw leading the NL.",
        -30,
    ),
    (
        "first_night_game_1935_crosley",
        "DIAMOND_CULTURE",
        "On May 24, 1935, President Franklin D. Roosevelt pressed a ceremonial telegraph key at the White House to switch on the floodlights for MLB's first night game at which ballpark?",
        "Crosley Field",
        "Ebbets Field",
        "Shibe Park",
        "Sportsman's Park",
        "Reds general manager Larry MacPhail championed the lights to boost Depression-era attendance.",
        "Cincinnati edged Philadelphia 2-1 in front of 20,422 curious evening spectators.",
        "Crosley Field in Cincinnati inaugurated Major League night baseball on May 24, 1935, permanently transforming the sport.",
        -40,
    ),
    (
        "strike_1994_expos",
        "DIAMOND_CULTURE",
        "Halting play on August 12 and cancelling the World Series for the only time since 1904, the 1994 MLB players' strike froze which franchise atop baseball's standings at 74-40?",
        "Montreal Expos",
        "New York Yankees",
        "Chicago White Sox",
        "Atlanta Braves",
        "Pedro Martinez, Larry Walker, Marquis Grissom, and Moises Alou starred on Felipe Alou's thrilling roster.",
        "Tony Gwynn was also left stranded at .394 while Matt Williams stood on pace to break Maris's 61 homers.",
        "The 1994 work stoppage wiped out the World Series and crushed the 74-40 Montreal Expos' best title chance before their eventual move to Washington.",
        -80,
    ),
    (
        "aagpbl_1943_wrigley",
        "DIAMOND_CULTURE",
        "Keeping pro baseball alive while MLB stars served in World War II, chewing-gum magnate Philip K. Wrigley founded what 1943-1954 circuit immortalized in 'A League of Their Own'?",
        "All-American Girls Professional Baseball League",
        "Women's National Diamond Association",
        "Midwest Ladies Hardball League",
        "American Women's Baseball Congress",
        "The Rockford Peaches won four championships and featured star hitter Dorothy 'Dottie' Kamenshek.",
        "Over 600 women played across Midwest cities like Racine, Kenosha, and South Bend.",
        "The All-American Girls Professional Baseball League drew nearly a million fans in 1948 and earned a permanent Cooperstown exhibit in 1988.",
        -85,
    ),
    (
        "phillie_phanatic_1978",
        "DIAMOND_CULTURE",
        "Purportedly hailing from the Galapagos Islands with an extendable tongue and four-wheeler ATV, what beloved green mascot debuted at Veterans Stadium in April 1978?",
        "Phillie Phanatic",
        "Mr. Met",
        "Orbit",
        "Wally the Green Monster",
        "Designed by Muppets collaborators Bonnie Erickson and Wayde Harrison, he famously tangled with Tommy Lasorda.",
        "He was inducted into the Mascot Hall of Fame's inaugural class in 2005.",
        "The Phillie Phanatic became baseball's gold-standard mascot after debuting for Philadelphia in 1978.",
        -120,
    ),
    (
        "nationals_teddy_roosevelt_525",
        "DIAMOND_CULTURE",
        "In Washington's beloved mid-game Presidents Race, which foam-headed Founding Father or President famously lost 525 consecutive races before finally winning in October 2012?",
        "Teddy Roosevelt",
        "Abraham Lincoln",
        "George Washington",
        "Thomas Jefferson",
        "For seven full seasons he suffered comedic sabotage by mascots, villains, and his own clumsiness.",
        "His breakthrough win came right as the Nationals clinched their first division title in 2012.",
        "Teddy Roosevelt's 0-for-525 losing streak became a beloved Nationals Park running gag until his triumphant 2012 victory.",
        -60,
    ),
    (
        "bull_durham_crash_davis",
        "DIAMOND_CULTURE",
        "Written by former minor-leaguer Ron Shelton in 1988, which acclaimed baseball film stars Kevin Costner as veteran catcher Crash Davis mentoring wild rookie pitcher 'Nuke' LaLoosh?",
        "Bull Durham",
        "Major League",
        "Field of Dreams",
        "The Natural",
        "Sports Illustrated later crowned it the number-one sports movie of all time.",
        "Crash Davis holds the fictional minor-league career home run record of 247.",
        "Ron Shelton's 1988 classic 'Bull Durham' captured minor-league bus rides, pitching clichés, and baseball romance with unmatched wit.",
        -115,
    ),
    (
        "the_natural_wonderboy",
        "DIAMOND_CULTURE",
        "Carved from a lightning-struck oak tree, the mythical bat named 'Wonderboy' belongs to fictional slugger Roy Hobbs in what Bernard Malamud novel and 1984 Robert Redford film?",
        "The Natural",
        "Bang the Drum Slowly",
        "Eight Men Out",
        "For Love of the Game",
        "In the movie climax, Hobbs shatters the stadium light towers as sparks shower the outfield.",
        "Hobbs plays for the fictional New York Knights under manager Pop Fisher.",
        "Roy Hobbs and his lightning-carved bat 'Wonderboy' anchored 'The Natural', one of cinema's grandest baseball fables.",
        -105,
    ),
    (
        "yankee_stadium_short_porch",
        "DIAMOND_CULTURE",
        "Measuring just 314 feet down the right-field line, what architectural quirk of Yankee Stadium earned it the nickname 'The House That Ruth Built'?",
        "The Short Porch",
        "The Green Monster",
        "The Tal's Hill Berm",
        "The Triangle",
        "Yankees owners deliberately pulled the right-field barrier in to showcase Babe Ruth's towering left-handed pull power.",
        "When the new Yankee Stadium opened in 2009, architects replicated the exact 314-foot distance.",
        "Yankee Stadium's 314-foot right-field Short Porch has rewarded left-handed pull hitters from Babe Ruth to Juan Soto for over a century.",
        -95,
    ),
    (
        "pnc_park_clemente_bridge",
        "DIAMOND_CULTURE",
        "Closing to vehicle traffic on game days so fans can stroll across the Allegheny River straight toward the skyline views of PNC Park, the Sixth Street Bridge honors which Pirates legend?",
        "Roberto Clemente",
        "Honus Wagner",
        "Willie Stargell",
        "Bill Mazeroski",
        "Its signature bright gold suspension towers frame every broadcast shot from behind home plate.",
        "The ballpark opened in 2001 and sits across the river from downtown Pittsburgh.",
        "Pittsburgh renamed the Sixth Street Bridge for Roberto Clemente in 1999, giving PNC Park baseball's most picturesque pedestrian entrance.",
        -75,
    ),
    (
        "kauffman_stadium_fountains",
        "DIAMOND_CULTURE",
        "Opened in 1973 in Kansas City as a rare baseball-only gem during the concrete-donut era, Kauffman Stadium is famed for its 322-foot outfield display of what?",
        "Water fountains",
        "Live pine trees",
        "Steam locomotives",
        "Brick warehouses",
        "The choreographed 'Water Spectacular' erupts between innings and after every Royals home run.",
        "It sits right beside Arrowhead Stadium inside the Truman Sports Complex.",
        "Kauffman Stadium's iconic 322-foot Water Spectacular fountains have defined Kansas City summer nights for over half a century.",
        -80,
    ),
    (
        "dodger_stadium_chavez_ravine",
        "DIAMOND_CULTURE",
        "Opened in 1962 in Los Angeles with mid-century pastel seats and San Gabriel Mountain views, Dodger Stadium was built into the terraced hillsides of what famous canyon?",
        "Chavez Ravine",
        "Laurel Canyon",
        "Topanga Canyon",
        "Runyon Canyon",
        "After Fenway Park and Wrigley Field, it is the third-oldest active stadium in Major League Baseball.",
        "Its unique hillside design lets fans enter directly at their seating deck level from surrounding parking lots.",
        "Carved into Chavez Ravine overlooking downtown Los Angeles, Dodger Stadium has hosted more than 10 World Series since 1962.",
        -85,
    ),
    (
        "joe_torre_4_titles",
        "DIAMOND_CULTURE",
        "After winning the 1971 NL MVP as a player without ever reaching a World Series, this calm manager piloted the Yankees to four championships in five years from 1996 to 2000.",
        "Joe Torre",
        "Buck Showalter",
        "Joe Girardi",
        "Jim Leyland",
        "Tabloids initially mocked his 1995 hiring as 'Clueless Joe' before New York rolled to 12 straight playoff trips.",
        "He entered Cooperstown as a manager in 2014 alongside Tony La Russa and Bobby Cox.",
        "Joe Torre turned 1990s Bronx turbulence into a dynasty, guiding the Yankees to four titles in five seasons.",
        -90,
    ),
    (
        "tommy_lasorda_dodger_blue",
        "DIAMOND_CULTURE",
        "Boasting that he would 'bleed Dodger Blue' and declaring the 'Big Dodger in the Sky' watched over his clubs, who managed Los Angeles for 20 seasons and won 2000 Olympic gold?",
        "Tommy Lasorda",
        "Walter Alston",
        "Dave Roberts",
        "Sparky Anderson",
        "He piloted the Dodgers to World Series crowns in 1981 and 1988 after replacing Walter Alston in 1976.",
        "At age 72 he guided a roster of minor-leaguers past Cuba to win Sydney Olympic gold in 2000.",
        "Tommy Lasorda won 1,599 MLB games and served as baseball's most passionate global ambassador for over six decades.",
        -100,
    ),
    (
        "tinker_evers_chance_poem",
        "DIAMOND_CULTURE",
        "'These are the saddest of possible words' begins Franklin Pierce Adams's 1910 newspaper poem immortalizing which Cubs double-play trio?",
        "Tinker to Evers to Chance",
        "Rizzuto to Coleman to Skowron",
        "Trammell to Whitaker to Evans",
        "Concepcion to Morgan to Perez",
        "All three infielders were inducted together into the Hall of Fame in 1946 largely thanks to the verse's fame.",
        "Ironically, Joe Tinker and Johnny Evers barely spoke off the field for years!",
        "Franklin Pierce Adams's eight-line poem 'Baseball's Sad Lexicon' turned the 1906-1910 Cubs infield into eternal trivia legend.",
        -60,
    ),
    (
        "brewers_sausage_race",
        "DIAMOND_CULTURE",
        "Sprinting down the warning track every 6th inning in Milwaukee, the famous Klement's/Johnsonville Racing Sausages feature Bratwurst, Polish, Italian, Chorizo, and which fifth racer?",
        "Hot Dog",
        "Kielbasa",
        "Andouille",
        "Bockwurst",
        "The tradition began as a 1990s scoreboard animation at County Stadium before costumed runners took the field.",
        "In 2003 Pirates first baseman Randall Simon infamously tapped the Italian Sausage with a bat mid-race.",
        "Milwaukee's beloved Racing Sausages race every Brewers home game featuring Bratwurst, Polish, Italian, Hot Dog, and Chorizo.",
        -70,
    ),
    (
        "wrigley_lights_8_8_88",
        "DIAMOND_CULTURE",
        "When Wrigley Field finally switched on permanent stadium lights on August 8, 1988 (8/8/88), Mother Nature intervened as rain washed out the inaugural night game against whom?",
        "Philadelphia Phillies",
        "St. Louis Cardinals",
        "New York Mets",
        "Pittsburgh Pirates",
        "The first official completed night game at Wrigley therefore took place one evening later against the Mets.",
        "Cubs founder Philip K. Wrigley had originally donated steel earmarked for lights to the WWII war effort in 1941.",
        "Rain drenched Wrigley Field's historic 8/8/88 night opener vs. Philadelphia in the 4th inning, delaying the first official night win until August 9.",
        10,
    ),
    (
        "first_hall_of_fame_class_1936",
        "DIAMOND_CULTURE",
        "Elected in 1936 as Cooperstown's inaugural 'First Five' immortals were Ty Cobb, Babe Ruth, Honus Wagner, Christy Mathewson, and which legendary Washington pitcher?",
        "Walter Johnson",
        "Cy Young",
        "Grover Cleveland Alexander",
        "Nap Lajoie",
        "Cy Young was elected the following year in 1937 alongside Tris Speaker and Nap Lajoie.",
        "All five inductees received over 75% of the BBWAA ballot, led by Ty Cobb at 98.2%.",
        "Ty Cobb, Babe Ruth, Honus Wagner, Christy Mathewson, and Walter Johnson formed the inaugural 1936 Hall of Fame class.",
        -50,
    ),
    (
        "jackie_robinson_day_april_15",
        "DIAMOND_CULTURE",
        "Every April 15 since 2009, every single MLB player, manager, and coach across all 30 clubs wears which uniform number on field?",
        "42",
        "24",
        "21",
        "3",
        "Ken Griffey Jr. originally asked Commissioner Bud Selig for permission to wear it in 2007, inspiring the league-wide tribute.",
        "MLB had permanently retired the number across every team in 1997 on the 50th anniversary of integration.",
        "Every April 15 on Jackie Robinson Day, all of Major League Baseball wears number 42 to honor Robinson's 1947 debut.",
        -135,
    ),
    (
        "henry_chadwick_box_score",
        "DIAMOND_CULTURE",
        "An English-born New York sportswriter nicknamed the 'Father of Baseball', who invented the modern box score, batting average, and the letter 'K' for strikeout?",
        "Henry Chadwick",
        "Bill James",
        "Grantland Rice",
        "Ring Lardner",
        "He chose 'K' because 'S' was already taken by sacrifice and 'K' is the final letter in 'struck'.",
        "He became the only pure sportswriter elected to Cooperstown as a full pioneer in 1938.",
        "Henry Chadwick adapted cricket scorekeeping into baseball's box score and statistical language during the 1850s and 1860s.",
        -20,
    ),
    (
        "fifth_inning_stretch_taft_legend",
        "DIAMOND_CULTURE",
        "Though baseball lore often credits which portly U.S. President with inventing the 7th-inning stretch by standing up at a 1910 Washington opener, the custom actually dates to the 1860s?",
        "William Howard Taft",
        "Theodore Roosevelt",
        "Woodrow Wilson",
        "Calvin Coolidge",
        "He DID legitimately start the enduring tradition of the Presidential ceremonial first pitch on Opening Day 1910!",
        "Historians traced the 7th-inning stretch back to an 1869 Harry Wright letter noting Cincinnati fans stood in the 7th.",
        "President William Howard Taft threw MLB's first presidential Opening Day pitch in 1910 and inspired the enduring stretch folklore.",
        -40,
    ),
    (
        "peskys_pole_302_feet",
        "DIAMOND_CULTURE",
        "Standing just 302 feet from home plate along Fenway Park's curving right-field line, the yellow foul pole is named after which light-hitting Red Sox shortstop who hit only 17 career homers?",
        "Johnny Pesky",
        "Bobby Doerr",
        "Dom DiMaggio",
        "Rico Petrocelli",
        "Broadcaster Mel Parnell playfully nicknamed the pole after the contact hitter hooked a game-winner around it in 1948.",
        "Boston officially dedicated the landmark in his honor on his 87th birthday in 2006.",
        "Fenway's cozy 302-foot right-field foul pole is named Pesky's Pole after beloved Red Sox icon Johnny Pesky.",
        -55,
    ),
    (
        "monument_park_yankee_stadium",
        "DIAMOND_CULTURE",
        "Located in fair territory inside deep center field until 1973 renovations moved it behind the fence, what open-air shrine at Yankee Stadium honors Bronx legends with bronze plaques?",
        "Monument Park",
        "Legends Walk",
        "Hall of Immortals",
        "Heritage Plaza",
        "For decades, outfielders like Joe DiMaggio and Mickey Mantle actually had to chase 460-foot balls around stone monuments in play!",
        "The first monument honored manager Miller Huggins in 1932, followed by Lou Gehrig and Babe Ruth.",
        "Yankee Stadium's Monument Park originally sat IN PLAY in cavernous center field before becoming a beloved behind-the-wall museum.",
        -90,
    ),
    (
        "tals_hill_houston",
        "DIAMOND_CULTURE",
        "From 2000 through 2016, Houston's Minute Maid Park featured an eccentric 30-degree grassy incline AND an in-play flagpole in 436-foot center field named after which Astros executive?",
        "Tal Smith",
        "Craig Biggio",
        "Jeff Bagwell",
        "Drayton McLane",
        "Outfielders like Lance Berkman and Carlos Beltran made fearless uphill leaping catches along its slope.",
        "The Astros finally leveled the hill before the 2017 season to shorten center field to 409 feet.",
        "Inspired by old Crosley Field's terrace, Tal's Hill in Houston was named for longtime team president Tal Smith.",
        -35,
    ),
    (
        "cy_young_award_first_1956",
        "DIAMOND_CULTURE",
        "Created in 1956 with just ONE winner across all of MLB until 1967, the inaugural Cy Young Award went to which Brooklyn Dodgers right-hander who also won 1956 NL MVP?",
        "Don Newcombe",
        "Warren Spahn",
        "Whitey Ford",
        "Sal Maglie",
        "He went 27-7 that year and remains the only player ever to win Rookie of the Year, MVP, and Cy Young.",
        "Justin Verlander and Clayton Kershaw later won MVP and Cy Young, but neither won Rookie of the Year.",
        "Brooklyn's Don Newcombe claimed MLB's first Cy Young Award in 1956, completing a career ROY-MVP-Cy Young trio never matched since.",
        20,
    ),
    (
        "unwritten_rules_cycle_reverse",
        "DIAMOND_CULTURE",
        "Hitting a home run, triple, double, and single in exact descending order across a game is known in baseball lore as what rare variation?",
        "A reverse natural cycle",
        "A grand cycle",
        "An inside-out cycle",
        "A golden cycle",
        "Going single, double, triple, then home run in exact ascending order is called a 'natural cycle'.",
        "Only a handful of players - including Luke Scott (2006) and Carlos Gomez (2008) - have ever completed it.",
        "A natural cycle progresses 1B-2B-3B-HR in exact order, whereas HR-3B-2B-1B is baseball's rare reverse natural cycle.",
        -10,
    ),
    (
        "statcast_barrel_2015",
        "DIAMOND_CULTURE",
        "Debuting across all 30 MLB ballparks in 2015 using Doppler radar and high-speed optical cameras, what MLB tracking system popularized 'exit velocity', 'launch angle', and 'spin rate'?",
        "Statcast",
        "PITCHf/x",
        "TrackMan Pro",
        "Hawk-Eye Classic",
        "Its data inspired the league-wide 'launch angle revolution' emphasizing lifted line drives over ground balls.",
        "It defines a 'Barrel' as a batted ball struck at 98+ mph within an optimal launch-angle window.",
        "MLB launched Statcast league-wide in 2015, transforming modern scouting, player development, and broadcast graphics.",
        -95,
    ),
    (
        "interleague_play_1997",
        "DIAMOND_CULTURE",
        "Ending 94 years of AL-vs-NL separation outside the World Series and All-Star Game, MLB introduced regular-season Interleague Play in June of which year?",
        "1997",
        "1994",
        "2001",
        "1990",
        "The very first regular-season interleague matchup pitted the San Francisco Giants against the Texas Rangers in Arlington.",
        "Stan Javier of the Giants hit the inaugural interleague home run on June 12.",
        "Regular-season Interleague Play debuted on June 12, 1997, giving fans annual Subway Series and Crosstown Classics.",
        -55,
    ),
    (
        "wild_card_1995_debut",
        "DIAMOND_CULTURE",
        "Originally scheduled for 1994 before the strike intervened, MLB's three-division format and Wild Card playoff berth made their actual October debut in which season?",
        "1995",
        "1993",
        "1997",
        "1998",
        "The New York Yankees and Colorado Rockies became the first two Wild Card teams to reach the postseason.",
        "Two years later, the 1997 Florida Marlins became the first Wild Card club to win the World Series.",
        "The 1995 postseason ushered in the Division Series and Wild Card era, expanding MLB playoffs from four teams to eight.",
        -45,
    ),
    (
        "silver_slugger_1980",
        "DIAMOND_CULTURE",
        "Awarded annually since 1980 by Louisville Slugger to the best offensive player at each position in both leagues, which trophy has Barry Bonds won a record 12 times?",
        "Silver Slugger Award",
        "Hank Aaron Award",
        "Edgar Martinez Award",
        "Golden Bat Award",
        "Managers and coaches vote on the winners based on batting average, on-base, and slugging production.",
        "Mike Piazza leads all catchers with 10, while Mike Trout leads active players with nine.",
        "The Silver Slugger Award serves as the offensive counterpart to the Gold Glove, honoring each position's premier hitter since 1980.",
        -95,
    ),
    (
        "hank_aaron_award_1999",
        "DIAMOND_CULTURE",
        "Introduced in 1999 on the 25th anniversary of home run number 715 to honor the top overall hitter in each league, which trophy went first to Manny Ramirez and Sammy Sosa?",
        "Hank Aaron Award",
        "Ted Williams Award",
        "Babe Ruth Award",
        "Lou Gehrig Award",
        "Alex Rodriguez won it four times while Barry Bonds and Aaron Judge each captured multiple trophies.",
        "Unlike MVP, pitchers are ineligible and defense does not weigh into the voting.",
        "MLB created the Hank Aaron Award in 1999 to celebrate pure hitting excellence in both the American and National Leagues.",
        -35,
    ),
    (
        "roberto_clemente_award",
        "DIAMOND_CULTURE",
        "Originally named the Commissioner's Award in 1971 before being renamed in 1973, which annual MLB honor recognizes the player who best combines on-field play with community philanthropy?",
        "Roberto Clemente Award",
        "Lou Gehrig Memorial Award",
        "Branch Rickey Award",
        "Jackie Robinson Award",
        "Every MLB club nominates one player each September, with Willie Mays winning the inaugural 1971 honor.",
        "Winners wear a special gold '21' patch on the back of their caps.",
        "The Roberto Clemente Award is MLB's highest humanitarian honor, celebrating service inspired by Clemente's 1972 Nicaragua relief mission.",
        -90,
    ),
    (
        "commissioners_trophy_flags",
        "DIAMOND_CULTURE",
        "Crafted in sterling silver by Tiffany & Co. for every World Series champion since 1967, the Commissioner's Trophy features a circle of gold-plated pennants representing what?",
        "Every MLB franchise",
        "Every Hall of Fame class",
        "Every World Series decade",
        "Every postseason inning",
        "Originally designed with 20 flags in 1967, it grew alongside expansion to 30 flags today.",
        "Unlike the Stanley Cup, a brand-new trophy is forged and kept permanently by each year's winner.",
        "The Tiffany-crafted Commissioner's Trophy surrounds a silver baseball with 30 golden flags, one for each Major League Baseball club.",
        -60,
    ),
    (
        "baseball_162_games_1961",
        "DIAMOND_CULTURE",
        "After 57 seasons of playing a 154-game schedule, Major League Baseball expanded to its current 162-game regular season alongside franchise expansion in which two years?",
        "1961 in the AL and 1962 in the NL",
        "1958 in both leagues",
        "1969 in both leagues",
        "1955 in the NL and 1956 in the AL",
        "Adding the Angels and new Senators gave the AL 10 teams in 1961, followed by the Mets and Colt .45s in the NL in 1962.",
        "That extra eight-game stretch sparked the famous debate over Roger Maris's 61 homers in 1961.",
        "MLB moved from 154 to 162 games when the AL expanded to 10 clubs in 1961 and the NL followed suit in 1962.",
        -15,
    ),
    (
        "dodgers_giants_west_1958",
        "DIAMOND_CULTURE",
        "Bringing Major League Baseball to the Pacific Coast for the first time in 1958, New York's Giants moved to San Francisco while the Brooklyn Dodgers relocated to which city?",
        "Los Angeles",
        "San Diego",
        "Oakland",
        "Seattle",
        "Dodgers owner Walter O'Malley persuaded Giants owner Horace Stoneham to join him west so clubs had a travel partner.",
        "The Dodgers spent their first four California seasons playing inside the cavernous 1932 Olympic Memorial Coliseum.",
        "The twin 1958 moves of the Dodgers and Giants ended baseball's East-Midwest footprint and launched West Coast MLB.",
        -120,
    ),
    (
        "first_canadian_mlb_expos_1969",
        "DIAMOND_CULTURE",
        "Playing their first home game at Jarry Park on April 14, 1969, which expansion club became the first Major League Baseball franchise based outside the United States?",
        "Montreal Expos",
        "Toronto Blue Jays",
        "Vancouver Canadians",
        "Ottawa Lynx",
        "Named after the 1967 Expo 67 World's Fair, their tri-color 'eMb' cap became a timeless streetwear classic.",
        "In 2005 the franchise relocated south to become the Washington Nationals.",
        "The Montreal Expos debuted in 1969 as MLB's first Canadian team, eight years before the Toronto Blue Jays joined in 1977.",
        -95,
    ),
    (
        "yankees_pinstripes_origin",
        "DIAMOND_CULTURE",
        "First worn briefly in 1912 and made permanent in 1915, the New York Yankees' iconic home uniform design features navy-blue vertical stripes known worldwide as what?",
        "Pinstripes",
        "Stirrups",
        "Piping",
        "Chevrons",
        "Despite urban myth claiming they were designed to slim down Babe Ruth, the Yankees adopted them five years before acquiring Ruth!",
        "The Chicago Cubs and New York Giants had also experimented with thin stripes earlier in the 1900s.",
        "The Yankees adopted their timeless home pinstripes in 1915 - five full years before Babe Ruth ever arrived from Boston.",
        -125,
    ),
    (
        "seventh_inning_god_bless_america",
        "DIAMOND_CULTURE",
        "Which legendary 1941 broadcast line did Yankees announcer Mel Allen make famous for every Bronx home run - echoing a popular Ballantine Beer sponsor?",
        "How about that!",
        "Holy Cow!",
        "Going, going, gone!",
        "Touch 'em all!",
        "Known as 'The Voice of the Yankees', he called 20 World Series and 24 All-Star Games.",
        "Later generations knew his warm voice as the longtime host of 'This Week in Baseball'.",
        "Mel Allen's signature 'How about that!' and 'Ballantine Blast!' defined Yankees radio and television across their 1940s-1960s golden era.",
        -25,
    ),
    (
        "ohtani_two_way_rule_2022",
        "DIAMOND_CULTURE",
        "Nicknamed 'The Ohtani Rule', a 2022 MLB rule adjustment allows a starting pitcher who bats in the lineup to stay in the game as what after leaving the mound?",
        "Designated hitter",
        "Pinch runner",
        "First baseman",
        "Defensive replacement",
        "Previously, pulling a starting pitcher who hit for himself meant losing his bat from the lineup too.",
        "Shohei Ohtani's unprecedented two-way dominance prompted MLB and the MLBPA to enshrine the rule permanently.",
        "The 2022 'Ohtani Rule' lets a starting pitcher remain in the batting order as the DH even after being replaced on the mound.",
        -75,
    ),
    (
        "triple_play_rarest_unassisted",
        "DIAMOND_CULTURE",
        "Even rarer than a perfect game (with only 15 ever recorded in MLB history), what lightning-fast defensive play sees a single fielder record all three outs without throwing the ball?",
        "Unassisted triple play",
        "Hidden ball trick",
        "Around-the-horn double play",
        "Immaculate inning",
        "Neal Ball turned the first modern one in 1909, and Troy Tulowitzki, Asdrubal Cabrera, and Eric Bruntlett joined in the 2000s.",
        "Typically a middle infielder catches a line drive, steps on second base, and tags the runner arriving from first.",
        "Only 15 unassisted triple plays have occurred in Major League history - nine fewer than MLB's 24 perfect games.",
        -85,
    ),
    (
        "hidden_ball_trick_todd_helton",
        "DIAMOND_CULTURE",
        "Requiring the pitcher to stay off the pitching rubber so a balk isn't called, what cheeky infield deception catches an unwary runner stepping off a base when the fielder never threw the ball back?",
        "The hidden ball trick",
        "The squeeze play",
        "The phantom tag",
        "The skunk in the outfield",
        "Todd Helton (2013), Mike Lowell (2005), and Matt Williams (1997) all pulled off memorable modern versions.",
        "Once the pitcher steps onto the dirt mound rubber without the ball, umpires immediately call a balk.",
        "The hidden ball trick remains legal under MLB rules as long as the pitcher stays off the rubber until the fielder tags the fooled runner.",
        -100,
    ),
    (
        "suicide_squeeze_bunt",
        "DIAMOND_CULTURE",
        "Unlike a safety squeeze where the runner on third waits to see the ball hit the ground, what daring small-ball play sends the runner sprinting home the instant the pitcher releases?",
        "Suicide squeeze",
        "Hit-and-run",
        "Double steal",
        "Sacrifice fly",
        "If the batter misses the bunt, the runner is almost always trapped in a hopeless rundown.",
        "Clark Griffith's 1904-1905 New York Highlanders helped popularize the nerve-wracking play.",
        "On a suicide squeeze, the runner breaks home on the pitch, trusting the batter to put down a bunt no matter where the ball is thrown.",
        -95,
    ),
    (
        "first_mlb_world_series_trophy_name",
        "DIAMOND_CULTURE",
        "Though fans long called the championship hardware simply the World Series Trophy, MLB officially named it the Commissioner's Trophy in 1985 after which predecessor's 1967 commission?",
        "William Eckert",
        "Kenesaw Mountain Landis",
        "Bowie Kuhn",
        "Peter Ueberroth",
        "The 1967 St. Louis Cardinals were the very first World Series champions to receive the sterling silver trophy.",
        "Prior to 1967, World Series winners received only championship rings and a pennant flag.",
        "Commissioner William Eckert commissioned baseball's first annual World Series trophy in 1967, renamed the Commissioner's Trophy in 1985.",
        50,
    ),
    (
        "cooperstown_1939_dedication",
        "DIAMOND_CULTURE",
        "Celebrating baseball's supposed centennial on June 12, 1939, the National Baseball Hall of Fame and Museum opened its doors in which picturesque upstate New York village?",
        "Cooperstown",
        "Saratoga Springs",
        "Seneca Falls",
        "Lake Placid",
        "Eleven living legends - including Ruth, Cobb, Wagner, Johnson, and Cy Young - posed for a famous opening-day portrait.",
        "Doubleday Field sits just two blocks away from the museum's plaque gallery.",
        "Located along Otsego Lake, Cooperstown, New York, opened the National Baseball Hall of Fame and Museum on June 12, 1939.",
        -135,
    ),
    (
        "cuba_negro_leagues_martin_dihigo",
        "DIAMOND_CULTURE",
        "Star pitcher, slugger, and nine-position dynamo known as 'El Inmortal', which Cuban legend is the ONLY person inducted into the U.S., Cuban, Mexican, Venezuelan, and Dominican Halls of Fame?",
        "Martin Dihigo",
        "Cristobal Torriente",
        "Jose Mendez",
        "Minnie Minoso",
        "In 1938 in Mexico he won both the batting title (.387) AND the pitching ERA crown (0.90) in the exact same season!",
        "He was elected to Cooperstown in 1977 via the Negro Leagues Committee.",
        "Cuban legend Martin Dihigo excelled at every position on the diamond and stands enshrined in five national baseball Halls of Fame.",
        25,
    ),
    (
        "effa_manley_first_woman_hof",
        "DIAMOND_CULTURE",
        "Co-owning and fiercely managing business operations for the 1946 Negro World Series champion Newark Eagles, who became the first woman elected to Cooperstown in 2006?",
        "Effa Manley",
        "Toni Stone",
        "Marge Schott",
        "Kim Ng",
        "She demanded MLB pay fair compensation when Brooklyn and Cleveland signed her stars Don Newcombe and Larry Doby.",
        "She was also a prominent civil rights activist who organized 'Don't Buy Where You Can't Work' boycotts in Harlem.",
        "Effa Manley guided the Newark Eagles to the 1946 Negro World Series crown and broke Cooperstown's gender barrier in 2006.",
        -15,
    ),
    (
        "kim_ng_first_female_gm",
        "DIAMOND_CULTURE",
        "Hired by the Miami Marlins in November 2020 after decades in Yankees, Dodgers, and MLB front offices, who became the first female general manager in MLB history?",
        "Kim Ng",
        "Rachel Balkovec",
        "Effa Manley",
        "Alyssa Nakken",
        "Under her leadership, Miami surged to an 84-78 record and a 2023 National League Wild Card berth.",
        "She became the first woman GM across all four major North American men's professional sports leagues.",
        "Kim Ng made sports history in 2020 as MLB's first female general manager, guiding the Marlins to the 2023 postseason.",
        -85,
    ),
    (
        "tony_stone_negro_leagues",
        "DIAMOND_CULTURE",
        "Signed by the Indianapolis Clowns in 1953 to replace departing teenager Hank Aaron at second base, who became the first woman to play regularly in a men's pro baseball league?",
        "Toni Stone",
        "Mamie Johnson",
        "Connie Morgan",
        "Ila Borders",
        "She famously lined a base hit off Hall of Fame pitcher Satchel Paige in an exhibition game.",
        "Mamie 'Peanut' Johnson and Connie Morgan soon followed her onto Negro Leagues rosters.",
        "Marcenia Lyle 'Toni' Stone batted .243 in 1953 for the Indianapolis Clowns, blazing a trail as the first female pro regular in the Negro Leagues.",
        10,
    ),
    (
        "minnie_minoso_five_decades",
        "DIAMOND_CULTURE",
        "Known as 'The Cuban Comet' for the Chicago White Sox, this Hall of Famer debuted in 1949 and made cameo MLB appearances in 1976 and 1980 to become one of only two players to play in five decades.",
        "Minnie Minoso",
        "Nick Altrock",
        "Julio Franco",
        "Satchel Paige",
        "In 1976 at age 50, he actually lined a clean single off Angels pitcher Sid Monge!",
        "He was finally elected to the National Baseball Hall of Fame in the Class of 2022.",
        "Orestes 'Minnie' Minoso broke Chicago's color barrier in 1951 and joined Nick Altrock as MLB's sole five-decade players.",
        0,
    ),
    (
        "satchel_paige_dont_look_back",
        "DIAMOND_CULTURE",
        "'Don't look back - something might be gaining on you' is the most famous maxim from whose humorous 'Rules for Staying Young'?",
        "Satchel Paige",
        "Yogi Berra",
        "Casey Stengel",
        "Dizzy Dean",
        "His other rules included 'Avoid fried meats which angry up the blood' and 'Keep the juices flowing by jangling around gently.'",
        "He famously pitched three scoreless MLB innings at age 59 in 1965.",
        "Satchel Paige's timeless six rules for staying young made him one of baseball's greatest philosophers as well as pitchers.",
        -60,
    ),
    (
        "yogi_berra_fork_in_road",
        "DIAMOND_CULTURE",
        "'When you come to a fork in the road, take it' was genuine driving directions to his Montclair, New Jersey home (which sat on a loop!) coined by which Hall of Famer?",
        "Yogi Berra",
        "Casey Stengel",
        "Bob Uecker",
        "Sparky Anderson",
        "His other immortal quips include 'Nobody goes there anymore - it's too crowded' and '90 percent of this game is half mental.'",
        "A museum and learning center honoring this 10-time World Series champion catcher stands today on Montclair State University's campus.",
        "Yogi Berra's famous 'fork in the road' quote actually made literal sense because both forks led to his New Jersey street!",
        -110,
    ),
    (
        "sabermetrics_war_stat",
        "DIAMOND_CULTURE",
        "Measuring a player's total offensive, baserunning, defensive, or pitching value compared to a freely available Triple-A call-up, what all-in-one sabermetric stat is abbreviated WAR?",
        "Wins Above Replacement",
        "Weighted Average Runs",
        "Win-Adjusted Rating",
        "Weighted At-Bat Ratio",
        "Babe Ruth leads MLB history with over 180 career units of this metric on Baseball-Reference.",
        "A single season of 8.0 or higher is universally considered MVP-caliber.",
        "Wins Above Replacement (WAR) synthesizes hitting, fielding, baserunning, and pitching into one comprehensive measure of player value.",
        -120,
    ),
    (
        "ops_plus_100_baseline",
        "DIAMOND_CULTURE",
        "Adjusted for ballpark dimensions and league offensive environment, an OPS+ or ERA+ score of exactly 100 represents what level of MLB performance?",
        "League average",
        "All-Star caliber",
        "Replacement level",
        "Hall of Fame median",
        "An OPS+ of 150 means a hitter produced 50% above the MLB baseline after ballpark adjustments.",
        "Babe Ruth holds MLB's all-time career OPS+ mark at 206, more than double the 100-point benchmark.",
        "Both OPS+ and ERA+ are normalized so 100 always represents exact league average in any era or ballpark.",
        -80,
    ),
    (
        "whip_pitching_stat",
        "DIAMOND_CULTURE",
        "Invented in 1979 by Rotisserie fantasy-baseball pioneer Daniel Okrent, the pitching acronym WHIP measures walks plus hits divided by what?",
        "Innings pitched",
        "Batters faced",
        "Earned runs",
        "Games started",
        "Addie Joss (0.968) and Mariano Rivera (1.000) sit atop baseball's all-time career WHIP leaderboard.",
        "Pedro Martinez posted MLB's single-season modern record with an astonishing 0.737 WHIP in 2000.",
        "WHIP (Walks plus Hits per Inning Pitched) measures how many baserunners a pitcher permits per inning.",
        -105,
    ),
    (
        "rotisserie_league_1980",
        "DIAMOND_CULTURE",
        "Meeting over lunch at Manhattan's La Rotisserie Francaise restaurant in 1980, writer Daniel Okrent and friends invented what multi-billion-dollar modern sports pastime?",
        "Fantasy baseball",
        "Baseball card grading",
        "Sabermetric draft modeling",
        "Daily pick-em brackets",
        "The original 'Rotisserie League' drafted MLB players and scored teams across eight statistical categories.",
        "Its format quickly spread to football, basketball, and global fantasy sports.",
        "Daniel Okrent's 1980 Rotisserie League invented modern fantasy baseball and sparked the entire fantasy sports industry.",
        -75,
    ),
    (
        "moneyball_on_base_streak",
        "DIAMOND_CULTURE",
        "Holding MLB's all-time record by reaching base safely in 84 consecutive games during 1949, this Boston Red Sox icon was the patron saint of plate discipline.",
        "Ted Williams",
        "Joe DiMaggio",
        "Barry Bonds",
        "Wade Boggs",
        "Joe DiMaggio sits second all-time at 74 straight games reached base during 1941.",
        "He walked 162 times that 1949 season while winning his second AL MVP Award.",
        "Ted Williams reached base in 84 straight games from July 1 to September 27, 1949, a record untouched in over 75 years.",
        -25,
    ),
    (
        "wbc_pitching_shohei_bab_ruth_comp",
        "DIAMOND_CULTURE",
        "Before Shohei Ohtani posted 10 pitching wins and 34 homers in 2022, who was the only previous AL/NL player to record double-digit pitching wins and double-digit homers in the same season (1918)?",
        "Babe Ruth",
        "Bullet Rogan",
        "Wes Ferrell",
        "Don Newcombe",
        "In 1918 with Boston, that legend went 13-7 on the mound while tying for the AL lead with 11 home runs.",
        "Negro Leagues Hall of Famer Bullet Rogan also achieved the feat in 1922.",
        "Shohei Ohtani became the first AL/NL player in 104 years since Babe Ruth (1918) to tally 10+ wins and 10+ homers in a season.",
        -95,
    ),
    (
        "dodgers_brooklyn_trolley_origin",
        "DIAMOND_CULTURE",
        "The Los Angeles Dodgers trace their famous franchise nickname back to 1890s Brooklyn pedestrians who had to sidestep speeding streetcars, originally called what?",
        "Trolley Dodgers",
        "Bridge Dodgers",
        "Subway Dodgers",
        "Carriage Dodgers",
        "They also briefly went by the Bridegrooms, Superbas, and Robins before settling permanently on Dodgers in 1932.",
        "Brooklyn's dense web of electric trolley lines turned crossing Flatbush streets into a daily sport.",
        "The franchise name 'Dodgers' shortened 'Brooklyn Trolley Dodgers', honoring 1890s Brooklynites dodging electric streetcars.",
        -105,
    ),
    (
        "cubs_1902_nickname_origin",
        "DIAMOND_CULTURE",
        "Previously known as the White Stockings, Colts, and Orphans, Chicago's National League club earned the nickname 'Cubs' in 1902 when sportswriters poked fun at what feature of their roster?",
        "Their unusually young players",
        "Their furry winter coats",
        "A bear mascot kept at West Side Park",
        "Their tiny ballpark dimensions",
        "Manager Frank Selee rebuilt the roster with teenagers and rookies like Joe Tinker and Johnny Evers.",
        "The team officially adopted 'Cubs' on its uniforms in 1907 right before winning back-to-back World Series.",
        "Chicago sportswriters dubbed Frank Selee's youthful 1902 roster the 'Cubs', a nickname that stuck for over a century.",
        -40,
    ),
    (
        "yankees_highlanders_1913",
        "DIAMOND_CULTURE",
        "Before permanently becoming the New York Yankees in 1913 upon moving to the Polo Grounds, the franchise spent a decade playing at Washington Heights' Hilltop Park under what name?",
        "New York Highlanders",
        "New York Gothams",
        "New York Metropolitans",
        "New York Empires",
        "The name nodded both to their lofty Manhattan hilltop stadium and to team president Joseph Gordon's Scottish heritage.",
        "Newspaper headline writers preferred the shorter 'Yankees' (or 'Yanks') to fit narrow column widths.",
        "Founded as the 1901 Baltimore Orioles before moving to Manhattan in 1903, the New York Highlanders officially became the Yankees in 1913.",
        -75,
    ),
])


SIGNATURE_DIAMOND_CLASSICS.extend([
    (
        "sandy_koufax_4_nh",
        "IMMORTALS",
        "Hurling four no-hitters in four consecutive seasons (1962-1965) culminating in a 14-strikeout perfect game against the Cubs, who held the MLB career no-hitter record until Nolan Ryan?",
        "Sandy Koufax",
        "Bob Feller",
        "Cy Young",
        "Jim Maloney",
        "His September 9, 1965 perfect game saw Cubs starter Bob Hendley allow only ONE hit in a 1-0 thriller.",
        "He won three unanimous Cy Young Awards in 1963, 1965, and 1966 before elbow arthritis ended his career.",
        "Sandy Koufax passed Bob Feller and Cy Young with his fourth no-hitter in 1965, holding the record until Nolan Ryan threw his fifth in 1981.",
        -95,
    ),
    (
        "ws_1968_lolich_3_wins",
        "OCTOBER_DRAMA",
        "Matching Bob Gibson's fire with three complete-game wins - including Game 7 on two days' rest - which portly Tigers lefty won 1968 World Series MVP?",
        "Mickey Lolich",
        "Denny McLain",
        "Al Kaline",
        "Bill Freehan",
        "He even hit the ONLY home run of his entire 16-year MLB career in Game 2 of that Fall Classic!",
        "Detroit rallied from a 3-1 Series deficit to topple St. Louis in seven games.",
        "Mickey Lolich outdueled Bob Gibson 4-1 in Game 7 of the 1968 World Series, completing three victories to claim Series MVP.",
        -25,
    ),
    (
        "ws_1970_brooks_series",
        "OCTOBER_DRAMA",
        "Stealing hit after hit with diving backhand stops down the third-base line in a five-game triumph over Cincinnati's Big Red Machine, Brooks Robinson led which 1970 World Series champion?",
        "Baltimore Orioles",
        "Detroit Tigers",
        "Minnesota Twins",
        "Oakland Athletics",
        "Managed by Earl Weaver, the club featured three 20-game winners: Jim Palmer, Dave McNally, and Mike Cuellar.",
        "Boog Powell captured the 1970 AL MVP Award as they won 108 regular-season games.",
        "The 1970 Baltimore Orioles defeated Cincinnati 4-1 behind Brooks Robinson's legendary Series MVP glovework and .429 bat.",
        -45,
    ),
    (
        "ws_1999_yankees_sweep",
        "OCTOBER_DRAMA",
        "Going 11-1 across the entire October bracket and sweeping Atlanta in four straight games, which 1999 club captured the middle leg of baseball's last World Series three-peat?",
        "New York Yankees",
        "Boston Red Sox",
        "Cleveland Indians",
        "Texas Rangers",
        "Mariano Rivera won 1999 World Series MVP while Chad Curtis hit a Game 3 walk-off homer.",
        "No Major League franchise has won three consecutive World Series championships since their 1998-2000 run.",
        "Joe Torre's 1999 Yankees rolled through the Rangers, Red Sox, and Braves at 11-1 to win back-to-back titles on the way to a three-peat.",
        -60,
    ),
])


# =============================================================================
# 2. HAND-CRAFTED JEOPARDY / BROADCAST `stemVariants` ACROSS ALL 12 DOMAINS
#    IN `public/data/shards/shard_manifest.json` (45 TABLE TYPES, 189 ANGLES!)
#
# Structure:
#   - For prompt angles (SIGHTLINE_LOCK / CALIBRATOR_DIAL / CODEX_DUAL_RING):
#       aid: [variant_1, variant_2, variant_3, variant_4]
#       (angle["prompt"] is automatically prepended as stemVariants[0]!)
#   - For GAUNTLET_SHATTER angles:
#       aid: {"T": [t1, t2, t3], "F": [f1, f2, f3]}
#       (angle["truePrompt"] / ["falsePrompt"] automatically prepended as [0]!)
# =============================================================================

MANIFEST_STEM_VARIANTS: Dict[str, Dict[str, Any]] = {
    # ---------------- DOMAIN 0: WORLD HISTORY ----------------
    "hist_battle": {
        "hb_conflict": [
            "Turning back to {year}, {name} unfolded as part of which wider war or campaign?",
            "Historians file the {year} engagement known as {name} within which broader conflict?",
            "On the military timeline of {year}, which larger struggle encompassed {name}?",
            "Which sweeping conflict formed the backdrop for {name} in {year}?",
        ],
        "hb_country": [
            "Walk the battlefield of {name} ({year}) today and you would stand inside which modern nation?",
            "Within which present-day country's borders was {name} fought in {year}?",
            "On a modern world atlas, which country contains the historic site of {name} ({year})?",
            "Which contemporary nation encompasses the ground where {name} took place in {year}?",
        ],
        "hb_tf": {
            "T": [
                "A modern map places the historic battlefield of {name} ({year}) inside {country}.",
                "Military archives record that {name} ({year}) unfolded within present-day {country}.",
                "In {year}, the clash known as {name} was fought on territory belonging to modern {country}.",
            ],
            "F": [
                "A modern map places the historic battlefield of {name} ({year}) inside {fake}.",
                "Military archives record that {name} ({year}) unfolded within present-day {fake}.",
                "In {year}, the clash known as {name} was fought on territory belonging to modern {fake}.",
            ],
        },
        "hb_year": [
            "Set the chronometer to the exact year {name} took place during {conflict}.",
            "Which calendar year saw the clash of {name} in {conflict}?",
            "During {conflict}, in what year was {name} fought?",
            "Pinpoint the year on the historical ledger when {name} ({conflict}) unfolded.",
        ],
    },
    "hist_figure": {
        "hf_country": [
            "Born in {year}, historical figure {name} left a lasting mark on which country or realm?",
            "Which nation or realm claims {name} (b. {year}) among its notable historical figures?",
            "From the archives of {year}, which country or polity is linked with {name}?",
            "Trace the biography of {name} (born {year}) back to which country or realm?",
        ],
        "hf_rev": [
            "Scan the historical roll call: which figure here belongs to the story of {country}?",
            "Which of these notable figures from world history is linked to {country}?",
            "Whose historical legacy is tied to {country}?",
            "Which biographical entry from the Meridian archive connects directly to {country}?",
        ],
        "hf_tf": {
            "T": [
                "Historical records link {name} (born {year}) to {country}.",
                "Born in {year}, {name} is a historical figure associated with {country}.",
                "Biographical chronicles tie {name} (b. {year}) to the history of {country}.",
            ],
            "F": [
                "Historical records link {name} (born {year}) to {fake}.",
                "Born in {year}, {name} is a historical figure associated with {fake}.",
                "Biographical chronicles tie {name} (b. {year}) to the history of {fake}.",
            ],
        },
        "hf_year": [
            "Dial in the birth year of historical figure {name} ({country}).",
            "Which year saw the birth of {name}, a notable figure of {country}?",
            "In what calendar year was {name} ({country}) born?",
            "Set the timeline to the birth year of {name} of {country}.",
        ],
    },
    "hist_empire": {
        "he_cap": [
            "Founded in {year}, {name} governed its realm from which capital city?",
            "Which city served as the seat of power for {name} (est. {year})?",
            "Point to the capital from which {name} (established {year}) ruled.",
            "In the annals of {year}, what city stood as the capital of {name}?",
        ],
        "he_rev": [
            "Which historic realm or empire centered its government in {capital}?",
            "Once ruled from {capital}, which historical state or empire is this?",
            "Whose imperial or state banner flew over the capital city of {capital}?",
            "From {capital}, which historical polity governed its territory?",
        ],
        "he_tf": {
            "T": [
                "Historically, {capital} stood as the capital city of {name}.",
                "During its rule, {capital} served as the seat of government for {name}.",
                "Chroniclers record {capital} as the ruling capital of {name}.",
            ],
            "F": [
                "Historically, {fake} stood as the capital city of {name}.",
                "During its rule, {fake} served as the seat of government for {name}.",
                "Chroniclers record {fake} as the ruling capital of {name}.",
            ],
        },
        "he_year": [
            "Estimate the founding year when {name} first emerged on the historical map.",
            "In roughly what year was {name} established?",
            "Dial the Meridian chronometer to the establishment year of {name}.",
            "Around which calendar year did {name} come into existence?",
        ],
    },
    "hist_war": {
        "hw_country": [
            "In {year}, {name} shaped the destiny of which country or region?",
            "Which nation or territory was directly involved in {name} ({year})?",
            "Look back to {year}: which country or region lies at the heart of {name}?",
            "On the diplomatic and military map of {year}, which land is tied to {name}?",
        ],
        "hw_rev": [
            "Which of these landmark conflicts or accords directly touched {country}?",
            "Whose historical turning point in {country} matches one of these events?",
            "Which war or treaty from this slate directly involved {country}?",
            "Identify the historical event here tied directly to {country}.",
        ],
        "hw_tf": {
            "T": [
                "Historical records tie {name} ({year}) directly to {country}.",
                "In {year}, {name} directly involved {country}.",
                "Diplomatic and military archives link {name} ({year}) with {country}.",
            ],
            "F": [
                "Historical records tie {name} ({year}) directly to {fake}.",
                "In {year}, {name} directly involved {fake}.",
                "Diplomatic and military archives link {name} ({year}) with {fake}.",
            ],
        },
        "hw_year": [
            "Dial in the calendar year when {name} ({country}) unfolded.",
            "Which year marks the outbreak or signing of {name} ({country})?",
            "When did {name} ({country}) begin or take place?",
            "Pinpoint the year {name} entered the history of {country}.",
        ],
    },

    # ---------------- DOMAIN 1: SCIENCE & SPACE ----------------
    "sci_element": {
        "se_sym": [
            "On the periodic table, which chemical symbol represents {name}?",
            "Chemists abbreviate the element {name} with which official symbol?",
            "In a molecular formula, which letter symbol stands for {name}?",
            "Identify the standard IUPAC chemical symbol assigned to {name}.",
        ],
        "se_name": [
            "Spot '{symbol}' in a chemical formula and you are looking at which element?",
            "Which periodic table element is denoted by the symbol {symbol}?",
            "Decode the chemical symbol {symbol} to name its corresponding element.",
            "On Mendeleev's chart, which element answers to the symbol {symbol}?",
        ],
        "se_cat": [
            "Chemically, {name} ({symbol}) is classified inside which periodic table family?",
            "Which elemental group claims {name} ({symbol}) on the periodic chart?",
            "Place {name} ({symbol}) into its proper periodic table category.",
            "In inorganic chemistry, which family encompasses {name} ({symbol})?",
        ],
        "se_tf": {
            "T": [
                "On the periodic table, {symbol} is the official chemical symbol for {name}.",
                "Chemists represent the element {name} using the symbol {symbol}.",
                "In standard IUPAC notation, {name} carries the symbol {symbol}.",
            ],
            "F": [
                "On the periodic table, {fake} is the official chemical symbol for {name}.",
                "Chemists represent the element {name} using the symbol {fake}.",
                "In standard IUPAC notation, {name} carries the symbol {fake}.",
            ],
        },
        "se_anum": [
            "How many protons sit inside the nucleus of {name} ({symbol})?",
            "Dial in the exact atomic number of {name} ({symbol}).",
            "On the periodic table, what atomic number belongs to {name} ({symbol})?",
            "Pinpoint the proton count (atomic number) of {name} ({symbol}).",
        ],
    },
    "sci_scientist": {
        "ss_field": [
            "Born in {year}, researcher {name} built a lasting reputation in which scientific discipline?",
            "Which branch of science best defines the pioneering work of {name} (b. {year})?",
            "In the annals of science, {name} (born {year}) is chiefly remembered for which field?",
            "Which scientific domain claims {name} (born {year}) as one of its noted figures?",
        ],
        "ss_country": [
            "Which nation is associated with {field} researcher {name}?",
            "Link {name}, noted in {field}, to the country of their scientific career or heritage.",
            "Which country claims {field} scientist {name}?",
            "On the world map of science, which nation is tied to {name} ({field})?",
        ],
        "ss_rev": [
            "Which of these scientific thinkers made their primary mark in {field}?",
            "From this quartet of researchers, who specialized chiefly in {field}?",
            "Spot the scientist on this slate best known for advancing {field}.",
            "Which researcher here belongs to the intellectual lineage of {field}?",
        ],
        "ss_tf": {
            "T": [
                "Born in {year}, {name} earned scientific renown primarily in {field}.",
                "Science historians classify {name} (b. {year}) primarily within {field}.",
                "The research career of {name} (born {year}) centered chiefly on {field}.",
            ],
            "F": [
                "Born in {year}, {name} earned scientific renown primarily in {fake}.",
                "Science historians classify {name} (b. {year}) primarily within {fake}.",
                "The research career of {name} (born {year}) centered chiefly on {fake}.",
            ],
        },
        "ss_year": [
            "Set the timeline to the year {field} scientist {name} was born.",
            "Which calendar year saw the birth of {name} ({field})?",
            "When was {field} researcher {name} born?",
            "Dial in the birth year recorded for {name} ({field}).",
        ],
    },
    "sci_exoplanet": {
        "sx_method": [
            "Astronomers first detected the distant world {name} in {year} using which planet-hunting technique?",
            "Which detection method revealed exoplanet {name} to astronomers in {year}?",
            "How did observers confirm the existence of exoplanet {name} in {year}?",
            "In {year}, which observational technique unlocked the discovery of {name}?",
        ],
        "sx_fac": [
            "Which telescope, observatory, or space mission first spotted exoplanet {name}?",
            "Credit for detecting the extrasolar world {name} belongs to which facility or mission?",
            "Which astronomical observatory or survey logged the discovery of {name}?",
            "From which space mission or ground observatory was exoplanet {name} discovered?",
        ],
        "sx_tf": {
            "T": [
                "Astronomers detected the exoplanet {name} via the {method} technique.",
                "NASA's Exoplanet Archive credits the {method} method with uncovering {name}.",
                "The discovery of extrasolar planet {name} relied on the {method} method.",
            ],
            "F": [
                "Astronomers detected the exoplanet {name} via the {fake} technique.",
                "NASA's Exoplanet Archive credits the {fake} method with uncovering {name}.",
                "The discovery of extrasolar planet {name} relied on the {fake} method.",
            ],
        },
        "sx_year": [
            "Dial in the calendar year astronomers announced the discovery of exoplanet {name}.",
            "Which year marked the confirmation of extrasolar planet {name}?",
            "When did astronomers first discover exoplanet {name}?",
            "Pinpoint the discovery year of the distant world {name}.",
        ],
    },
    "sci_astro": {
        "sa_con": [
            "Aim a telescope toward which constellation to locate the {astro_type} {name}?",
            "On the celestial sphere, the {astro_type} {name} lies within which constellation?",
            "Which star-chart constellation hosts the {astro_type} known as {name}?",
            "Stargazers scanning the night sky find the {astro_type} {name} in which constellation?",
        ],
        "sa_rev": [
            "Which of these deep-sky objects resides inside the constellation {constellation}?",
            "Look toward {constellation} on a star atlas to find which celestial object?",
            "Among these astronomical targets, which lies within {constellation}?",
            "Which celestial object here belongs to the sky region of {constellation}?",
        ],
        "sa_type": [
            "Found in the constellation {constellation}, how do astronomers classify {name}?",
            "Which celestial category describes {name} inside {constellation}?",
            "When cataloged in {constellation}, {name} is identified as which kind of astronomical object?",
            "In deep-sky catalogs for {constellation}, what class of object is {name}?",
        ],
        "sa_tf": {
            "T": [
                "Star charts place the {astro_type} {name} inside the constellation {constellation}.",
                "Observers searching for the {astro_type} {name} look toward {constellation}.",
                "The celestial object {name} ({astro_type}) resides in {constellation}.",
            ],
            "F": [
                "Star charts place the {astro_type} {name} inside the constellation {fake}.",
                "Observers searching for the {astro_type} {name} look toward {fake}.",
                "The celestial object {name} ({astro_type}) resides in {fake}.",
            ],
        },
    },
    "sci_chemical": {
        "sc_form": [
            "Write out the molecular blueprint: which chemical formula represents {name}?",
            "In laboratory notation, which formula corresponds to {name}?",
            "Chemists denote {name} using which exact molecular formula?",
            "Which stoichiometric formula identifies {name}?",
        ],
        "sc_rev": [
            "Identify the chemical compound written in lab notation as {formula}.",
            "Which substance corresponds to the molecular formula {formula}?",
            "Decode the formula {formula} to name this chemical compound.",
            "In chemistry catalogs, which compound carries the formula {formula}?",
        ],
        "sc_tf": {
            "T": [
                "In chemical notation, {formula} is the verified formula for {name}.",
                "The molecular composition of {name} is written as {formula}.",
                "Standard chemistry references list {formula} as the formula of {name}.",
            ],
            "F": [
                "In chemical notation, {fake} is the verified formula for {name}.",
                "The molecular composition of {name} is written as {fake}.",
                "Standard chemistry references list {fake} as the formula of {name}.",
            ],
        },
        "sc_mass": [
            "Dial in the approximate molar mass (g/mol) of {name} ({formula}).",
            "Roughly how many grams per mole does {name} ({formula}) weigh?",
            "Estimate the molecular weight of {name} ({formula}).",
            "Calibrate the approximate molar mass of the compound {name} ({formula}).",
        ],
    },
    "sci_space": {
        "sm_ag": [
            "Launched in {year}, the mission {name} flew under which space agency or operator?",
            "Which space organization directed the {year} flight of {name}?",
            "Credit for operating the {year} spaceflight {name} belongs to which agency?",
            "In {year}, which spacefarer agency or operator launched {name}?",
        ],
        "sm_rev": [
            "Which of these space missions or craft flew under the banner of {agency}?",
            "Inspect the launch manifest: which mission here was operated by {agency}?",
            "Which spacecraft or spaceflight from this slate belongs to {agency}?",
            "Identify the space mission guided by {agency}.",
        ],
        "sm_tf": {
            "T": [
                "Mission logs credit {agency} with operating the {year} spaceflight {name}.",
                "In {year}, {agency} served as the operator of the space mission {name}.",
                "The {year} mission {name} was flown by {agency}.",
            ],
            "F": [
                "Mission logs credit {fake} with operating the {year} spaceflight {name}.",
                "In {year}, {fake} served as the operator of the space mission {name}.",
                "The {year} mission {name} was flown by {fake}.",
            ],
        },
        "sm_year": [
            "Set the launch clock to the year {agency} sent {name} into space.",
            "In what calendar year did the {agency} mission {name} lift off?",
            "Which year marked the launch of {name} ({agency})?",
            "Pinpoint the launch year for the spaceflight {name} ({agency}).",
        ],
    },

    # ---------------- DOMAIN 2: GEOGRAPHY & WONDERS ----------------
    "geo_city": {
        "gc_country": [
            "Spin the Meridian globe: which country is home to the city of {name}?",
            "Travelers bound for {name} are touching down in which nation?",
            "On a political map of the world, which country contains {name}?",
            "Which sovereign nation encompasses the urban center of {name}?",
        ],
        "gc_rev": [
            "Which of these cities sits within the borders of {country}?",
            "Pack a passport for {country} and you could visit which of these cities?",
            "On a map of {country}, which urban center appears here?",
            "Identify the city located inside {country}.",
        ],
        "gc_reg": [
            "Zoom into {country}: which state, province, or region encompasses {name}?",
            "Within {country}, {name} belongs to which administrative region or state?",
            "Which subnational province, state, or region of {country} contains {name}?",
            "Locate {name} inside {country} by selecting its state or region.",
        ],
        "gc_tf": {
            "T": [
                "World atlases place the city of {name} inside {country}.",
                "Geography records confirm that {name} is a city in {country}.",
                "The urban center of {name} is situated within the borders of {country}.",
            ],
            "F": [
                "World atlases place the city of {name} inside {fake}.",
                "Geography records confirm that {name} is a city in {fake}.",
                "The urban center of {name} is situated within the borders of {fake}.",
            ],
        },
        "gc_pop": [
            "Dial in the approximate population of {name}, {country}.",
            "Roughly how many residents live in {name}, {country}?",
            "Estimate the urban population of {name} in {country}.",
            "Calibrate the census scale for the city of {name}, {country}.",
        ],
    },
    "geo_airport": {
        "ga_city": [
            "Spot baggage tag '{iata}' at {airport} and you have arrived in which city?",
            "Which metropolitan city is served by {airport} ({iata})?",
            "Travelers landing at {airport} (code {iata}) are visiting which city?",
            "Match IATA hub {iata} ({airport}) with the city it serves.",
        ],
        "ga_code": [
            "Check your boarding pass for {airport} in {city}: what 3-letter IATA code appears?",
            "Which three-letter aviation code designates {airport} serving {city}?",
            "Luggage bound for {airport} in {city} carries which 3-letter IATA tag?",
            "Identify the official IATA airport code of {airport} ({city}).",
        ],
        "ga_country": [
            "Clear customs at {airport} (IATA: {iata}) and you are entering which country?",
            "Which nation hosts the aviation hub {airport} (code {iata})?",
            "On global flight maps, {airport} (IATA: {iata}) sits in which country?",
            "Touch down at {airport} ({iata}) inside which country?",
        ],
        "ga_tf": {
            "T": [
                "International flight rosters assign code {iata} ({airport}) to {country}.",
                "Travelers flying into {airport} ({iata}) land inside {country}.",
                "IATA code {iata} designates {airport}, situated in {country}.",
            ],
            "F": [
                "International flight rosters assign code {iata} to an airport in {fake}.",
                "Travelers flying into IATA code {iata} land inside {fake}.",
                "IATA code {iata} designates an airport situated in {fake}.",
            ],
        },
    },
    "geo_mountain": {
        "gm_country": [
            "Rising {elev_m} m above sea level, the peak {name} towers over which country?",
            "Mountaineers climbing {name} ({elev_m} m) ascend within which nation?",
            "Which country's topography features the {elev_m}-meter summit {name}?",
            "Locate the {elev_m}-meter mountain {name} on the world map: which country claims it?",
        ],
        "gm_rev": [
            "Which of these peaks rises above the landscape of {country}?",
            "Mountaineers trekking through {country} could summit which of these peaks?",
            "Spot the mountain on this list situated inside {country}.",
            "Which peak belongs to the highland geography of {country}?",
        ],
        "gm_tf": {
            "T": [
                "Topographic maps locate the summit {name} inside {country}.",
                "The mountain {name} rises within the borders of {country}.",
                "Mountaineering atlases place {name} in {country}.",
            ],
            "F": [
                "Topographic maps locate the summit {name} inside {fake}.",
                "The mountain {name} rises within the borders of {fake}.",
                "Mountaineering atlases place {name} in {fake}.",
            ],
        },
        "gm_elev": [
            "Set the altimeter to the approximate summit elevation of {name} ({country}).",
            "How tall above sea level does {name} in {country} stand?",
            "Estimate the peak altitude of {name} ({country}).",
            "Dial in the elevation of the summit {name} ({country}).",
        ],
    },
    "geo_river": {
        "gr_country": [
            "Winding for roughly {len_km} km, the waterway {name} flows through which country?",
            "Which nation's landscape is carved by the {len_km}-km river {name}?",
            "Trace the {len_km}-kilometer course of {name} to which country?",
            "On hydrological maps, {name} ({len_km} km) is associated with which nation?",
        ],
        "gr_rev": [
            "Which of these waterways winds through {country}?",
            "Follow the river basins of {country} to spot which river here?",
            "Which river on this slate flows within {country}?",
            "Identify the waterway belonging to the geography of {country}.",
        ],
        "gr_tf": {
            "T": [
                "Hydrological atlases chart the river {name} within {country}.",
                "The waterway {name} flows through {country}.",
                "Geography records place the river {name} in {country}.",
            ],
            "F": [
                "Hydrological atlases chart the river {name} within {fake}.",
                "The waterway {name} flows through {fake}.",
                "Geography records place the river {name} in {fake}.",
            ],
        },
        "gr_len": [
            "Gauge the approximate course length of {name} ({country}).",
            "Roughly how many kilometers long does {name} ({country}) run?",
            "Dial in the river length of {name} in {country}.",
            "Estimate the distance from source to mouth of {name} ({country}).",
        ],
    },
    "geo_wonder": {
        "gw_country": [
            "Which nation is home to the natural feature {name} ({geo_type})?",
            "Visit the {geo_type} known as {name} inside which country?",
            "On a physical atlas, the {geo_type} {name} belongs to which nation?",
            "Locate the {geo_type} {name} within which country's borders?",
        ],
        "gw_type": [
            "Inside {country}, what kind of landform or natural feature is {name}?",
            "How do geographers classify the natural landmark {name} in {country}?",
            "Visit {name} in {country} and you are beholding which type of geographical feature?",
            "Which geographic category best defines {name} ({country})?",
        ],
        "gw_rev": [
            "Which of these natural wonders or landforms lies inside {country}?",
            "Explore the wilderness of {country} to encounter which feature here?",
            "Spot the geographic landmark on this list situated in {country}.",
            "Which natural feature here is found within {country}?",
        ],
        "gw_tf": {
            "T": [
                "Physical maps place the {geo_type} {name} inside {country}.",
                "The natural landmark {name} ({geo_type}) is located in {country}.",
                "Travelers find the {geo_type} {name} within {country}.",
            ],
            "F": [
                "Physical maps place the {geo_type} {name} inside {fake}.",
                "The natural landmark {name} ({geo_type}) is located in {fake}.",
                "Travelers find the {geo_type} {name} within {fake}.",
            ],
        },
    },

    # ---------------- DOMAIN 3: ARTS & ARCHITECTURE ----------------
    "art_work": {
        "aw_artist": [
            "Completed in {year}, the work \"{title}\" bears the signature hand of which artist?",
            "Which master creator produced \"{title}\" in {year}?",
            "Step before \"{title}\" ({year}) in a museum gallery: whose work are you admiring?",
            "Art historians attribute the {year} piece \"{title}\" to which creator?",
        ],
        "aw_rev": [
            "Stroll through a retrospective of {artist}: which work here hangs on the wall?",
            "Which of these pieces belongs to the catalog of {artist}?",
            "Spot the artwork in this lineup created by {artist}!",
            "Which title from this gallery slate came from the studio of {artist}?",
        ],
        "aw_med": [
            "In what artistic medium did {artist} execute \"{title}\" ({year})?",
            "Check the gallery placard for \"{title}\" ({year}) by {artist}: what medium is listed?",
            "Which form or medium defines {artist}'s {year} work \"{title}\"?",
            "Museum curators catalog \"{title}\" ({year}) by {artist} under which medium?",
        ],
        "aw_tf": {
            "T": [
                "Curatorial archives credit {artist} with creating \"{title}\" ({year}, {medium}).",
                "In {year}, {artist} produced the {medium} work \"{title}\".",
                "Gallery records attribute \"{title}\" ({year}, {medium}) to {artist} on display.",
            ],
            "F": [
                "Curatorial archives credit {fake} with creating \"{title}\" ({year}, {medium}).",
                "In {year}, {fake} produced the {medium} work \"{title}\".",
                "Gallery records attribute \"{title}\" ({year}, {medium}) to {fake} on display.",
            ],
        },
        "aw_year": [
            "Date the masterpiece: around what year did {artist} create \"{title}\"?",
            "In what year did {artist} complete the work \"{title}\"?",
            "In roughly what calendar year did {artist} complete \"{title}\"?",
            "Pinpoint when {artist} produced the work \"{title}\".",
        ],
    },
    "art_landmark": {
        "al_country": [
            "Travel to inspect the landmark {name} ({arch_type}) in which country?",
            "Which nation's skyline or heritage boasts the {arch_type} {name}?",
            "Architectural guides place {name} ({arch_type}) inside which country?",
            "In which country does the historic {arch_type} {name} stand?",
        ],
        "al_type": [
            "Standing in {country}, {name} is an example of which architectural form?",
            "How do architectural historians classify {name} in {country}?",
            "Which building or monument category defines {name} ({country})?",
            "In {country}, {name} belongs to which architectural class?",
        ],
        "al_rev": [
            "Which of these architectural landmarks rises in {country}?",
            "Take an architectural tour of {country} to visit which landmark here?",
            "Spot the famed structure on this list located in {country}.",
            "Which monument or building here belongs to {country}?",
        ],
        "al_tf": {
            "T": [
                "Architectural atlases place {name} ({arch_type}) in {country}.",
                "To see the {arch_type} {name}, travelers journey to {country}.",
                "The landmark {name} ({arch_type}) stands within {country}.",
            ],
            "F": [
                "Architectural atlases place {name} ({arch_type}) in {fake}.",
                "To see the {arch_type} {name}, travelers journey to {fake}.",
                "The landmark {name} ({arch_type}) stands within {fake}.",
            ],
        },
        "al_year": [
            "Set the architectural timeline to the year {name} ({country}) was built or founded.",
            "Around which calendar year was {name} in {country} erected or established?",
            "When did construction or founding begin for {name} ({country})?",
            "Pinpoint the approximate year {name} ({country}) was established.",
        ],
    },
    "art_creator": {
        "ac_country": [
            "Born in {year}, {discipline} {name} is linked to the cultural heritage of which country?",
            "Which nation claims {name} ({discipline}, b. {year}) among its artistic figures?",
            "Trace the artistic legacy of {name} ({discipline}, born {year}) to which country?",
            "With which country is {discipline} {name} (b. {year}) chiefly associated?",
        ],
        "ac_disc": [
            "In the arts of {country}, {name} (b. {year}) earned renown in which discipline?",
            "Which creative craft best identifies {name} ({country}, born {year})?",
            "Art histories catalog {name} ({country}, b. {year}) under which discipline?",
            "Which artistic field defined the career of {name} ({country}, b. {year})?",
        ],
        "ac_tf": {
            "T_primary": "Artist {name} (born {year}) was primarily known in the field of {discipline}.",
            "F_primary": "Artist {name} (born {year}) was primarily known in the field of {fake}.",
            "T": [
                "Art chronicles record {name} (born {year}) primarily in the discipline of {discipline}.",
                "Born in {year}, {name} earned fame primarily in {discipline}.",
                "Cultural archives classify {name} (b. {year}) under {discipline}.",
            ],
            "F": [
                "Art chronicles record {name} (born {year}) primarily in the discipline of {fake}.",
                "Born in {year}, {name} earned fame primarily in {fake}.",
                "Cultural archives classify {name} (b. {year}) under {fake}.",
            ],
        },
        "ac_year": [
            "Dial in the birth year of {discipline} {name} ({country}).",
            "Which calendar year saw the birth of {name} ({discipline}, {country})?",
            "When was {country} {discipline} {name} born?",
            "Pinpoint the birth year of {discipline} {name} of {country}.",
        ],
    },

    # ---------------- DOMAIN 4: FILM, MUSIC & POP ----------------
    "pop_film": {
        "pf_dir": [
            "Step behind the camera of {year}: which filmmaker directed \"{title}\"?",
            "Which director helmed the {year} feature \"{title}\"?",
            "Roll the opening credits of \"{title}\" ({year}): whose name follows 'Directed by'?",
            "Cinema historians credit which director with the {year} release \"{title}\"?",
        ],
        "pf_rev": [
            "Which feature on this marquee belongs to the filmography of {director}?",
            "Step into a retrospective for {director}: which film here is screening?",
            "Which motion picture here did {director} helm?",
            "Which of these cinema titles was helmed by {director}?",
        ],
        "pf_country": [
            "Directed by {director} in {year}, \"{title}\" hailed from which country's film industry?",
            "Which nation produced {director}'s {year} picture \"{title}\"?",
            "On international festival rosters, \"{title}\" ({year}, dir. {director}) represents which country?",
            "Which country's cinema industry produced \"{title}\" ({year}, dir. {director})?",
        ],
        "pf_tf": {
            "T": [
                "Film archives credit {director} as director of the {year} release \"{title}\" ({country}).",
                "In {year}, {director} helmed the {country} motion picture \"{title}\".",
                "Cinema credits list {director} as director of \"{title}\" ({year}, {country}).",
            ],
            "F": [
                "Film archives credit {fake} as director of the {year} release \"{title}\" ({country}).",
                "In {year}, {fake} helmed the {country} motion picture \"{title}\".",
                "Cinema credits list {fake} as director of \"{title}\" ({year}, {country}).",
            ],
        },
        "pf_year": [
            "Set the marquee calendar to the release year of \"{title}\" (dir. {director}).",
            "In which year did {director}'s film \"{title}\" premiere?",
            "When did \"{title}\" (directed by {director}) hit theaters?",
            "Pinpoint the theatrical release year of \"{title}\" ({director}).",
        ],
    },
    "pop_album": {
        "pa_art": [
            "Drop the needle on {year}: which recording artist or band issued the album \"{title}\"?",
            "Whose discography includes the {year} studio record \"{title}\"?",
            "Check the record sleeve from {year}: who released \"{title}\"?",
            "Which act brought the album \"{title}\" to listeners in {year}?",
        ],
        "pa_rev": [
            "Flip through the vinyl catalog of {artist}: which album here belongs in it?",
            "Which of these records was released by {artist}?",
            "Which album on this slate was recorded by {artist}?",
            "Which title on this list sits inside the discography of {artist}?",
        ],
        "pa_tf": {
            "T": [
                "Music catalogs credit {artist} with the {year} album \"{title}\".",
                "In {year}, {artist} issued the album \"{title}\".",
                "Discography logs credit {artist} with releasing \"{title}\" in {year}.",
            ],
            "F": [
                "Music catalogs credit {fake} with the {year} album \"{title}\".",
                "In {year}, {fake} issued the album \"{title}\".",
                "Discography logs credit {fake} with releasing \"{title}\" in {year}.",
            ],
        },
        "pa_year": [
            "Dial in the release year when {artist} dropped the album \"{title}\".",
            "Which calendar year saw the debut of {artist}'s album \"{title}\"?",
            "When did {artist} release the record \"{title}\"?",
            "Pinpoint the year \"{title}\" by {artist} hit record shelves.",
        ],
    },
    "pop_song": {
        "ps_art": [
            "Cue up the {year} track \"{title}\": which artist or act recorded it?",
            "Which performer is heard on the {year} song \"{title}\"?",
            "Spin back to {year}: who delivered the song \"{title}\"?",
            "Whose voice or band headlines the {year} release \"{title}\"?",
        ],
        "ps_rev": [
            "Which of these tracks appears in the songbook of {artist}?",
            "Press play on a playlist for {artist}: which song here belongs?",
            "Which track on this slate did {artist} perform?",
            "Which single or song on this slate was recorded by {artist}?",
        ],
        "ps_tf": {
            "T": [
                "Recording logs credit {artist} with the {year} track \"{title}\".",
                "In {year}, {artist} performed the song \"{title}\".",
                "Chart archives credit {artist} with recording \"{title}\" in {year}.",
            ],
            "F": [
                "Recording logs credit {fake} with the {year} track \"{title}\".",
                "In {year}, {fake} performed the song \"{title}\".",
                "Chart archives credit {fake} with recording \"{title}\" in {year}.",
            ],
        },
        "ps_year": [
            "Set the chart clock to the year {artist} released \"{title}\".",
            "Which year saw {artist} release the song \"{title}\"?",
            "When did \"{title}\" by {artist} first hit the airwaves?",
            "Pinpoint the calendar year \"{title}\" ({artist}) debuted.",
        ],
    },
    "pop_tv": {
        "pt_country": [
            "Premiering in {year}, the TV series \"{title}\" aired first in which country?",
            "Which nation's broadcasters produced the {year} television show \"{title}\"?",
            "Trace the broadcast origin of \"{title}\" (debuted {year}) to which country?",
            "In {year}, which country brought the television series \"{title}\" to screens?",
        ],
        "pt_rev": [
            "Which of these television series originated on networks in {country}?",
            "Tune into television from {country}: which show here hails from there?",
            "Identify the TV series produced in {country}.",
            "Which broadcast title on this slate originated in {country}?",
        ],
        "pt_tf": {
            "T": [
                "Broadcast records show the {year} TV series \"{title}\" originated in {country}.",
                "The television program \"{title}\" ({year}) hails from {country}.",
                "In {year}, \"{title}\" debuted as a television series from {country}.",
            ],
            "F": [
                "Broadcast records show the {year} TV series \"{title}\" originated in {fake}.",
                "The television program \"{title}\" ({year}) hails from {fake}.",
                "In {year}, \"{title}\" debuted as a television series from {fake}.",
            ],
        },
        "pt_year": [
            "Dial in the premiere year of the {country} television series \"{title}\".",
            "Which calendar year marked the TV debut of \"{title}\" ({country})?",
            "When did the television series \"{title}\" ({country}) first air?",
            "Pinpoint the premiere year of \"{title}\" from {country}.",
        ],
    },
    "pop_band": {
        "pb_country": [
            "Formed in {year}, the musical outfit {name} got its start in which country?",
            "Which nation spawned the group {name} back in {year}?",
            "Trace the musical roots of {name} (formed {year}) to which country?",
            "In {year}, which country's music scene launched {name}?",
        ],
        "pb_rev": [
            "Which of these bands or ensembles came out of {country}?",
            "Scan the music scene of {country}: which group here formed there?",
            "Identify the musical act that originated in {country}.",
            "Which ensemble on this list traces its formation to {country}?",
        ],
        "pb_tf": {
            "T": [
                "Music histories trace the group {name} (formed {year}) to {country}.",
                "Founded in {year}, the musical act {name} hails from {country}.",
                "The ensemble {name} ({year}) originated in {country}.",
            ],
            "F": [
                "Music histories trace the group {name} (formed {year}) to {fake}.",
                "Founded in {year}, the musical act {name} hails from {fake}.",
                "The ensemble {name} ({year}) originated in {fake}.",
            ],
        },
        "pb_year": [
            "Set the timeline to the year {name} ({country}) first formed.",
            "Which calendar year saw the founding of the {country} band {name}?",
            "When did the musical group {name} ({country}) come together?",
            "Pinpoint when {name} ({country}) first formed.",
        ],
    },

    # ---------------- DOMAIN 5: SPORTS & GAMES ----------------
    "sport_athlete": {
        "spa_sport": [
            "Representing {country}, standout athlete {name} built a career in which sport?",
            "Step into the arena for {name} ({country}): which sport did they compete in?",
            "Which sporting discipline made {name} of {country} a competitor?",
            "Sports archives catalog {name} ({country}) under which sport?",
        ],
        "spa_country": [
            "Born in {year}, {sport} competitor {name} represented which nation?",
            "Which country's flag did {sport} athlete {name} (b. {year}) compete under?",
            "On international {sport} rosters, {name} (born {year}) is linked to which country?",
            "Link {sport} standout {name} (b. {year}) to their home nation.",
        ],
        "spa_rev": [
            "Which of these athletes made their mark in {sport}?",
            "Spot the competitor on this roster who starred in {sport}.",
            "Whose career stats belong to the record books of {sport}?",
            "Identify the athlete here known for competing in {sport}.",
        ],
        "spa_tf": {
            "T": [
                "Athletic records list {name} ({country}) as competing in {sport}.",
                "Competitor {name} of {country} played professionally in {sport}.",
                "Sports archives link {name} ({country}) with {sport}.",
            ],
            "F": [
                "Athletic records list {name} ({country}) as competing in {fake}.",
                "Competitor {name} of {country} played professionally in {fake}.",
                "Sports archives link {name} ({country}) with {fake}.",
            ],
        },
        "spa_year": [
            "Dial in the birth year of {sport} competitor {name} ({country}).",
            "Which calendar year saw the birth of {name} ({sport}, {country})?",
            "When was {country} {sport} athlete {name} born?",
            "Pinpoint the birth year on record for {sport} standout {name} ({country}).",
        ],
    },
    "sport_club": {
        "spc_country": [
            "Competing in {sport}, the club {name} plays its home slate in which country?",
            "Travel to cheer on {sport} side {name} inside which nation?",
            "Which country's {sport} leagues host the franchise {name}?",
            "Locate the {sport} club {name} on the world sports map: which country is home?",
        ],
        "spc_sport": [
            "Founded in {year} in {country}, the club {name} competes in which sport?",
            "Step inside the home ground of {name} ({country}, est. {year}): which sport is played?",
            "Which sporting code is contested by {name} ({country}, founded {year})?",
            "Sports directories classify {name} ({country}, {year}) under which sport?",
        ],
        "spc_tf": {
            "T": [
                "League directories place {sport} club {name} inside {country}.",
                "The {sport} side {name} calls {country} home.",
                "The {sport} franchise {name} competes in {country}.",
            ],
            "F": [
                "League directories place {sport} club {name} inside {fake}.",
                "The {sport} side {name} calls {fake} home.",
                "The {sport} franchise {name} competes in {fake}.",
            ],
        },
        "spc_year": [
            "Set the sports chronometer to the founding year of {sport} club {name} ({country}).",
            "Which calendar year saw the establishment of {name} ({sport}, {country})?",
            "When was the {country} {sport} club {name} founded?",
            "Pinpoint the inaugural founding year of {sport} franchise {name} ({country}).",
        ],
    },
    "sport_stadium": {
        "sps_country": [
            "Seating roughly {cap} spectators, the venue {name} stands in which country?",
            "Which nation hosts major matches inside {name} (capacity ~{cap})?",
            "Take a seat among ~{cap} fans at {name} in which country?",
            "On the global stadium atlas, {name} (cap. ~{cap}) lies in which country?",
        ],
        "sps_rev": [
            "Which of these stadiums or arenas rises in {country}?",
            "Match-day crowds in {country} pack the stands of which venue here?",
            "Identify the sports arena situated inside {country}.",
            "Spot the stadium on this list located within {country}.",
        ],
        "sps_tf": {
            "T": [
                "Venue guides locate the sports stadium {name} in {country}.",
                "Spectators visit {country} to attend matches at {name}.",
                "The arena {name} stands within the borders of {country}.",
            ],
            "F": [
                "Venue guides locate the sports stadium {name} in {fake}.",
                "Spectators visit {fake} to attend matches at {name}.",
                "The arena {name} stands within the borders of {fake}.",
            ],
        },
        "sps_cap": [
            "Estimate the approximate spectator seating capacity of {name} ({country}).",
            "Dial in how many fans {name} in {country} can hold at capacity.",
            "Roughly how large is the grandstand capacity of {name} ({country})?",
            "Calibrate the seating capacity of the {country} venue {name}.",
        ],
    },
    "sport_videogame": {
        "svg_dev": [
            "Released in {year}, the video game \"{title}\" was crafted by which development studio?",
            "Boot up \"{title}\" ({year}): which game studio appears on the developer splash screen?",
            "Which developer built the {year} title \"{title}\"?",
            "Gaming archives credit which studio with developing \"{title}\" in {year}?",
        ],
        "svg_rev": [
            "Which of these video games came out of the studios of {dev}?",
            "Browse the release catalog of {dev}: which title here belongs?",
            "Which video game here was crafted by {dev}?",
            "Which playable title on this slate was built by {dev}?",
        ],
        "svg_tf": {
            "T": [
                "Gaming archives credit {dev} with developing \"{title}\" ({year}).",
                "In {year}, studio {dev} shipped the video game \"{title}\".",
                "Developer {dev} released \"{title}\" in {year}.",
            ],
            "F": [
                "Gaming archives credit {fake} with developing \"{title}\" ({year}).",
                "In {year}, studio {fake} shipped the video game \"{title}\".",
                "Developer {fake} released \"{title}\" in {year}.",
            ],
        },
        "svg_year": [
            "Set the gaming timeline to the year {dev} debuted \"{title}\".",
            "Which calendar year saw {dev} launch \"{title}\"?",
            "When did the video game \"{title}\" ({dev}) first hit shelves?",
            "Pinpoint the inaugural release year of \"{title}\" ({dev}).",
        ],
    },

    # ---------------- DOMAIN 6: TECH & COMPUTING ----------------
    "tech_company": {
        "tc_country": [
            "Founded in {year} within {industry}, {name} operates its headquarters in which country?",
            "Which nation is home base for {industry} firm {name} (est. {year})?",
            "Trace the corporate headquarters of {name} ({industry}, {year}) to which country?",
            "In the global {industry} sector, {name} (founded {year}) is headquartered in which country?",
        ],
        "tc_ind": [
            "Headquartered in {country} since {year}, {name} competes chiefly in which industry?",
            "Which commercial sector defines {name} ({country}, est. {year})?",
            "Market analysts classify {name} ({country}, founded {year}) under which industry?",
            "What core industry drives the business of {name} ({country}, {year})?",
        ],
        "tc_rev": [
            "Which of these technology or industrial firms maintains its headquarters in {country}?",
            "Scan the corporate roster of {country}: which company here is based there?",
            "Identify the enterprise headquartered within {country}.",
            "Which business on this slate operates its headquarters from {country}?",
        ],
        "tc_tf": {
            "T": [
                "Corporate filings place {name}'s ({industry}) headquarters in {country}.",
                "The {industry} company {name} is based in {country}.",
                "Global business directories list {country} as headquarters for {name} ({industry}).",
            ],
            "F": [
                "Corporate filings place {name}'s ({industry}) headquarters in {fake}.",
                "The {industry} company {name} is based in {fake}.",
                "Global business directories list {fake} as headquarters for {name} ({industry}).",
            ],
        },
        "tc_year": [
            "Dial in the founding year of {name} ({country}, {industry}).",
            "Which calendar year saw the launch of {name} ({country}, {industry})?",
            "When was {name} ({industry}, {country}) officially founded?",
            "Pinpoint the establishment year of {name} ({country}, {industry}).",
        ],
    },
    "tech_pioneer": {
        "tp_country": [
            "Born in {year}, {role} {name} is associated with the technical heritage of which country?",
            "Which nation claims {role} {name} (b. {year}) among its engineering pioneers?",
            "Link {name} ({role}, born {year}) to their associated country.",
            "In computing and engineering history, {role} {name} (b. {year}) is tied to which nation?",
        ],
        "tp_role": [
            "In {country}, {name} (b. {year}) built a career primarily in which technical role?",
            "How do technology histories classify {name} ({country}, born {year})?",
            "Which engineering or technical title best fits {name} ({country}, b. {year})?",
            "For {country}, {name} (b. {year}) stands out chiefly in which technical capacity?",
        ],
        "tp_tf": {
            "T": [
                "Engineering chronicles link {role} {name} (born {year}) with {country}.",
                "Born in {year}, {role} {name} is historically tied to {country}.",
                "Technical biographies associate {name} ({role}, b. {year}) with {country}.",
            ],
            "F": [
                "Engineering chronicles link {role} {name} (born {year}) with {fake}.",
                "Born in {year}, {role} {name} is historically tied to {fake}.",
                "Technical biographies associate {name} ({role}, b. {year}) with {fake}.",
            ],
        },
        "tp_year": [
            "Set the chronometer to the birth year of {role} {name} ({country}).",
            "Which calendar year saw the birth of {country} {role} {name}?",
            "When was {role} {name} ({country}) born?",
            "Pinpoint the birth year recorded for {name} ({role}, {country}).",
        ],
    },
    "tech_software": {
        "ts_type": [
            "Introduced in {year}, {name} belongs to which category of computing technology?",
            "Developers classify {name} (launched {year}) as what kind of software or system?",
            "On the computing stack of {year}, what technical role does {name} fill?",
            "How do software engineers categorize {name} (debuted {year})?",
        ],
        "ts_rev": {
            "primary": "Which of these belongs to the category of {sw_type}?",
            "variants": [
                "Which of these computing names belongs to the category of {sw_type}?",
                "Scan the software stack: which item here is classified under {sw_type}?",
                "Identify the computing technology listed under {sw_type}.",
                "Which tool or platform on this slate falls into {sw_type}?",
            ],
        },
        "ts_tf": {
            "T_primary": "{name} (introduced {year}) is classified under {sw_type}.",
            "F_primary": "{name} (introduced {year}) is classified under {fake}.",
            "T": [
                "Computing references categorize {name} (introduced {year}) under {sw_type}.",
                "Introduced in {year}, {name} belongs to the {sw_type} software class.",
                "Engineers classify {name} ({year}) in the category of {sw_type}.",
            ],
            "F": [
                "Computing references categorize {name} (introduced {year}) under {fake}.",
                "Introduced in {year}, {name} belongs to the {fake} software class.",
                "Engineers classify {name} ({year}) in the category of {fake}.",
            ],
        },
        "ts_year": [
            "Dial in the inaugural release year of {name} ({sw_type}).",
            "In what calendar year did {name} ({sw_type}) first debut?",
            "When was the {sw_type} known as {name} first introduced?",
            "Pinpoint the launch year of {name} ({sw_type}).",
        ],
    },
    "tech_vehicle": {
        "tv_maker": [
            "Roll onto the assembly floor: which manufacturer built the {veh_type} {name}?",
            "Which automaker or aerospace firm produced the {veh_type} known as {name}?",
            "Whose engineering badge belongs on the {veh_type} {name}?",
            "Which builder stands behind the {veh_type} {name}?",
        ],
        "tv_type": [
            "Built by {maker}, {name} falls into which class of machine or vehicle?",
            "How do transport catalogs classify {maker}'s {name}?",
            "Inspect the blueprint for {name} by {maker}: what type of vehicle is it?",
            "Which mechanical category best fits {name}, manufactured by {maker}?",
        ],
        "tv_rev": [
            "Which of these models rolled off the production lines of {maker}?",
            "Browse the engineering lineup of {maker}: which vehicle here belongs?",
            "Which craft or vehicle on this list was built by {maker}?",
            "Which model on this list carries the manufacturer stamp of {maker}?",
        ],
        "tv_tf": {
            "T": [
                "Production registries credit {maker} with manufacturing {name} ({veh_type}).",
                "{maker} engineered and produced the {veh_type} {name} for service.",
                "Manufacturer {maker} built {name} ({veh_type}) on its production line.",
            ],
            "F": [
                "Production registries credit {fake} with manufacturing {name} ({veh_type}).",
                "{fake} engineered and produced the {veh_type} {name} for service.",
                "Manufacturer {fake} built {name} ({veh_type}) on its production line.",
            ],
        },
    },

    # ---------------- DOMAIN 7: NATURE & BIOLOGY ----------------
    "nat_species": {
        "ns_grp": [
            "In biological taxonomy, the {name} belongs to which major organism group?",
            "Field naturalists classify the {name} within which biological group?",
            "Place the {name} into its proper kingdom or vertebrate/botanical group.",
            "Which living class or group encompasses the {name}?",
        ],
        "ns_sci": [
            "Open Linnaeus's ledger: what Latin binomial names the {name}?",
            "Biologists identify the {name} by which official scientific name?",
            "Which two-part Latin scientific name corresponds to the {name}?",
            "In taxonomy guides, the {name} is listed under which scientific name?",
        ],
        "ns_rev": [
            "Decode the Latin binomial \"{sci}\": which {group} bears this scientific name?",
            "In field biology, \"{sci}\" is the scientific name of which {group}?",
            "Which {group} is cataloged by taxonomists as \"{sci}\"?",
            "Match the Latin name \"{sci}\" with the proper {group}.",
        ],
        "ns_tf": {
            "T_primary": "The {name} ({sci}) is classified within the {group} group.",
            "F_primary": "The {name} ({sci}) is classified within the {fake} group.",
            "T": [
                "Biological taxonomy places the {name} ({sci}) inside the {group} group.",
                "Naturalists classify {name} ({sci}) within {group}.",
                "Species registries assign {name} ({sci}) to the {group} category.",
            ],
            "F": [
                "Biological taxonomy places the {name} ({sci}) inside the {fake} group.",
                "Naturalists classify {name} ({sci}) within {fake}.",
                "Species registries assign {name} ({sci}) to the {fake} category.",
            ],
        },
    },

    # ---------------- DOMAIN 8: WORLD AFFAIRS, LAW & ECONOMICS ----------------
    "soc_country": {
        "scn_cap": [
            "Diplomatic embassies for {name} gather in which official national capital?",
            "Point to the seat of government for the nation of {name}.",
            "Which city serves as the national capital of {name}?",
            "On a diplomatic map, what city is the capital of {name}?",
        ],
        "scn_rev": [
            "Which sovereign nation governs from the capital city of {capital}?",
            "Fly into the capital {capital} and you are at the political heart of which country?",
            "Whose national flag flies over government halls in {capital}?",
            "Identify the country whose official capital is {capital}.",
        ],
        "scn_cur": [
            "Step up to a market stall in {name} (capital: {capital}): which official currency do you spend?",
            "Which monetary unit circulates as the official currency of {name} (capital: {capital})?",
            "Central bankers in {name} (capital: {capital}) issue which official currency?",
            "Name the legal tender currency of {name} (capital: {capital}).",
        ],
        "scn_cont": [
            "Locate {name} (capital: {capital}) on the globe: which continent or world region hosts it?",
            "Geopolitically, {name} (capital: {capital}) lies in which world region or continent?",
            "Which continent or macro-region encompasses {name} (capital: {capital})?",
            "On world atlases, {name} (capital: {capital}) sits within which continent?",
        ],
        "scn_tf": {
            "T": [
                "Diplomatic directories list {capital} as the capital city of {name}.",
                "The government of {name} is seated in {capital}.",
                "{capital} serves as the official national capital of {name}.",
            ],
            "F": [
                "Diplomatic directories list {fake} as the capital city of {name}.",
                "The government of {name} is seated in {fake}.",
                "{fake} serves as the official national capital of {name}.",
            ],
        },
    },
    "soc_university": {
        "su_country": [
            "Founded in {year}, the campus of {name} welcomes scholars in which country?",
            "Which nation is home to {name} (established {year})?",
            "Walk the academic grounds of {name} (founded {year}) in which country?",
            "Higher-education directories place {name} (est. {year}) inside which country?",
        ],
        "su_rev": [
            "Which of these universities operates its campus inside {country}?",
            "Scholars studying in {country} could enroll at which institution here?",
            "Identify the university situated within {country}.",
            "Spot the academic institution on this slate located in {country}.",
        ],
        "su_tf": {
            "T": [
                "Academic registries locate {name} (founded {year}) in {country}.",
                "Founded in {year}, {name} operates as a university in {country}.",
                "Scholars travel to {country} to attend {name} (est. {year}).",
            ],
            "F": [
                "Academic registries locate {name} (founded {year}) in {fake}.",
                "Founded in {year}, {name} operates as a university in {fake}.",
                "Scholars travel to {fake} to attend {name} (est. {year}).",
            ],
        },
        "su_year": [
            "Dial in the founding year of {name} in {country}.",
            "Which calendar year saw the establishment of {name} ({country})?",
            "When did {name} ({country}) first open its academic doors?",
            "Pinpoint the charter or founding year of {name} ({country}).",
        ],
    },
    "soc_org": {
        "so_country": [
            "Founded in {year}, the {org_type} known as {name} is tied to which country?",
            "Which nation is associated with {name} ({org_type}, est. {year})?",
            "Trace the institutional home of {name} ({org_type}, {year}) to which country?",
            "In public life, {name} ({org_type}, founded {year}) connects to which nation?",
        ],
        "so_type": [
            "In {country} (founded {year}), {name} functions as what kind of institution?",
            "How do reference guides classify {name} ({country}, est. {year})?",
            "Which institutional category best fits {name} ({country}, {year})?",
            "What sort of body or organization is {name} in {country} (founded {year})?",
        ],
        "so_rev": [
            "Which of these institutions is linked to {country}?",
            "Scan the civic ledger of {country}: which organization here belongs?",
            "Identify the institution or media outlet associated with {country}.",
            "Which entry on this slate is tied to {country}?",
        ],
        "so_tf": {
            "T": [
                "Civic archives link {name} ({org_type}) with {country}.",
                "The {org_type} known as {name} is associated with {country}.",
                "Institutional directories place {name} ({org_type}) in {country}.",
            ],
            "F": [
                "Civic archives link {name} ({org_type}) with {fake}.",
                "The {org_type} known as {name} is associated with {fake}.",
                "Institutional directories place {name} ({org_type}) in {fake}.",
            ],
        },
        "so_year": [
            "Set the chronometer to the founding year of {name} ({country}, {org_type}).",
            "Which calendar year saw the creation of {name} ({country}, {org_type})?",
            "When was {name} ({org_type}, {country}) established?",
            "Pinpoint the founding year of {name} ({country}, {org_type}).",
        ],
    },
    "soc_leader": {
        "sl_country": [
            "Born in {year}, {role} {name} shaped public life in which country?",
            "Which nation's civic history claims {role} {name} (b. {year})?",
            "Link {name} ({role}, born {year}) to their associated country.",
            "In law, economics, or statecraft, {role} {name} (b. {year}) is tied to which nation?",
        ],
        "sl_role": [
            "In {country}, {name} (b. {year}) rose to prominence in which public role?",
            "Which civic or scholarly calling defines {name} ({country}, born {year})?",
            "Biographies of {country} catalog {name} (b. {year}) under which public role?",
            "What primary public role is associated with {name} ({country}, b. {year})?",
        ],
        "sl_tf": {
            "T": [
                "Public-affairs records associate {role} {name} (born {year}) with {country}.",
                "Born in {year}, {role} {name} is linked to {country}.",
                "Historical biographies connect {name} ({role}, b. {year}) to {country}.",
            ],
            "F": [
                "Public-affairs records associate {role} {name} (born {year}) with {fake}.",
                "Born in {year}, {role} {name} is linked to {fake}.",
                "Historical biographies connect {name} ({role}, b. {year}) to {fake}.",
            ],
        },
        "sl_year": [
            "Dial in the birth year of {role} {name} ({country}).",
            "Which calendar year saw the birth of {country} {role} {name}?",
            "When was {role} {name} ({country}) born?",
            "Pinpoint the birth year on record for {name} ({role}, {country}).",
        ],
    },

    # ---------------- DOMAIN 9: FOOD, CRAFT & DESIGN ----------------
    "food_item": {
        "fi_country": [
            "Sample {name} ({food_type}) at the table: which country's culinary tradition created it?",
            "Which nation claims {name} ({food_type}) as a signature culinary specialty?",
            "Trace the gastronomic roots of {name} ({food_type}) back to which country?",
            "On a world food map, {name} ({food_type}) hails from which country?",
        ],
        "fi_type": [
            "Order {name} in {country} and what culinary category arrives at your table?",
            "Gastronomy guides classify {name} from {country} under which food or drink type?",
            "Which culinary class best describes {country}'s {name}?",
            "In {country}, {name} is traditionally served as which type of fare?",
        ],
        "fi_rev": [
            "Which of these culinary specialties originated in the kitchens of {country}?",
            "Step into a traditional market in {country} to sample which item here?",
            "Identify the dish or drink rooted in {country}.",
            "Which specialty on this menu hails from {country}?",
        ],
        "fi_tf": {
            "T": [
                "Culinary atlases trace {name} ({food_type}) to {country}.",
                "The specialty {name} ({food_type}) traditionally hails from {country}.",
                "Food historians credit {country} with originating {name} ({food_type}).",
            ],
            "F": [
                "Culinary atlases trace {name} ({food_type}) to {fake}.",
                "The specialty {name} ({food_type}) traditionally hails from {fake}.",
                "Food historians credit {fake} with originating {name} ({food_type}).",
            ],
        },
    },
    "food_brand": {
        "fb_country": [
            "Established in {year}, the {brand_type} {name} traces its heritage to which country?",
            "Which nation birthed the {brand_type} house {name} in {year}?",
            "Follow the craft atelier of {name} ({brand_type}, {year}) back to which country?",
            "In {year}, {name} ({brand_type}) opened its doors in which nation?",
        ],
        "fb_type": [
            "Founded in {country} in {year}, {name} is renowned in which craft or design field?",
            "How do style and craft directories categorize {name} ({country}, est. {year})?",
            "Which artisan or brand category defines {name} ({country}, {year})?",
            "What craft or luxury specialty built the reputation of {name} ({country}, est. {year})?",
        ],
        "fb_rev": [
            "Which of these heritage craft, culinary, or design houses began in {country}?",
            "Stroll the flagship ateliers of {country} to encounter which house here?",
            "Identify the brand or atelier rooted in {country}.",
            "Which house on this list traces its origins to {country}?",
        ],
        "fb_tf": {
            "T": [
                "Design archives trace the {brand_type} {name} to {country}.",
                "The heritage {brand_type} {name} was founded in {country}.",
                "{name} ({brand_type}) has its original home in {country}.",
            ],
            "F": [
                "Design archives trace the {brand_type} {name} to {fake}.",
                "The heritage {brand_type} {name} was founded in {fake}.",
                "{name} ({brand_type}) has its original home in {fake}.",
            ],
        },
        "fb_year": [
            "Dial in the founding year of {name} ({brand_type}, {country}).",
            "Which calendar year saw the launch of {name} ({brand_type}, {country})?",
            "When was the {brand_type} house {name} ({country}) established?",
            "Pinpoint the inaugural year of {name} ({brand_type}, {country}).",
        ],
    },
    "food_maker": {
        "fm_country": [
            "Born in {year}, {craft} figure {name} is associated with which nation's creative tradition?",
            "Which country claims {craft} {name} (b. {year})?",
            "Trace the craft heritage of {name} ({craft}, born {year}) to which nation?",
            "In culinary or design circles, {craft} {name} (b. {year}) connects to which country?",
        ],
        "fm_craft": [
            "In {country}, {name} (b. {year}) achieved acclaim in which craft or culinary arena?",
            "Which creative calling best defines {name} ({country}, born {year})?",
            "Design and gastronomy guides list {name} ({country}, b. {year}) under which craft?",
            "What culinary or design specialty made {name} ({country}, b. {year}) notable?",
        ],
        "fm_tf": {
            "T": [
                "Craft biographies associate {craft} {name} (born {year}) with {country}.",
                "Born in {year}, {craft} figure {name} is linked to {country}.",
                "Design and culinary records tie {name} ({craft}, b. {year}) to {country}.",
            ],
            "F": [
                "Craft biographies associate {craft} {name} (born {year}) with {fake}.",
                "Born in {year}, {craft} figure {name} is linked to {fake}.",
                "Design and culinary records tie {name} ({craft}, b. {year}) to {fake}.",
            ],
        },
        "fm_year": [
            "Set the timeline to the birth year of {craft} {name} ({country}).",
            "Which calendar year saw the birth of {country} {craft} {name}?",
            "When was {craft} {name} ({country}) born?",
            "Pinpoint the birth year recorded for {name} ({craft}, {country}).",
        ],
    },

    # ---------------- DOMAIN 10: MYTH & LITERATURE ----------------
    "lit_work": {
        "lw_auth": [
            "Published in {year}, the work \"{title}\" came from the pen of which author?",
            "Pull \"{title}\" ({year}) from the library shelf: whose name graces the spine?",
            "Which writer authored the {year} literary work \"{title}\"?",
            "Literary archives credit which author with \"{title}\" in {year}?",
        ],
        "lw_rev": [
            "Open the collected bibliography of {author}: which work here belongs inside?",
            "Which of these titles was penned by {author}?",
            "Which literary work on this slate did {author} write?",
            "Which volume on this reading list is the creation of {author}?",
        ],
        "lw_lang": [
            "Before any translation, {author} originally composed \"{title}\" ({year}) in which language?",
            "In what tongue was \"{title}\" ({year}) by {author} first written?",
            "Check the first edition of \"{title}\" ({year}) by {author}: what was its original language?",
            "Which literary language birthed {author}'s {year} work \"{title}\"?",
        ],
        "lw_tf": {
            "T": [
                "Literary catalogs credit {author} with the {year} {lang} work \"{title}\".",
                "In {year}, {author} penned \"{title}\" in {lang}.",
                "Bibliographies list {author} as author of \"{title}\" ({year}, {lang}).",
            ],
            "F": [
                "Literary catalogs credit {fake} with the {year} {lang} work \"{title}\".",
                "In {year}, {fake} penned \"{title}\" in {lang}.",
                "Bibliographies list {fake} as author of \"{title}\" ({year}, {lang}).",
            ],
        },
        "lw_year": [
            "Dial in the inaugural publication year of {author}'s \"{title}\".",
            "Which calendar year saw {author}'s \"{title}\" reach readers?",
            "When was \"{title}\" by {author} first published?",
            "Set the literary timeline to the debut year of \"{title}\" ({author}).",
        ],
    },
    "lit_author": {
        "la_country": [
            "Born in {year}, {role} {name} belongs to the literary heritage of which country?",
            "Which nation claims {role} {name} (b. {year}) among its authors or thinkers?",
            "Trace the literary roots of {name} ({role}, born {year}) to which country?",
            "Which country's letters or philosophy is associated with {role} {name} (b. {year})?",
        ],
        "la_role": [
            "In {country}, {name} (b. {year}) earned distinction in which literary or philosophical role?",
            "Which calling in letters or thought defines {name} ({country}, born {year})?",
            "Biographical dictionaries classify {name} ({country}, b. {year}) under which role?",
            "What primary literary or philosophical craft describes {name} ({country}, b. {year})?",
        ],
        "la_tf": {
            "T": [
                "Literary histories link {role} {name} (born {year}) with {country}.",
                "Born in {year}, {role} {name} is associated with {country}.",
                "Biographical archives tie {name} ({role}, b. {year}) to {country}.",
            ],
            "F": [
                "Literary histories link {role} {name} (born {year}) with {fake}.",
                "Born in {year}, {role} {name} is associated with {fake}.",
                "Biographical archives tie {name} ({role}, b. {year}) to {fake}.",
            ],
        },
        "la_year": [
            "Set the timeline to the birth year of {role} {name} ({country}).",
            "Which calendar year saw the birth of {country} {role} {name}?",
            "When was {role} {name} ({country}) born?",
            "Pinpoint the birth year of {name} ({role}, {country}).",
        ],
    },
    "lit_myth": {
        "lm_trad": [
            "Open the folklore compendia: {name} ({mtype}) hails from which mythological tradition?",
            "Which ancient pantheon or mythic tradition tells tales of {name} ({mtype})?",
            "Storytellers of which mythological tradition speak of {name} ({mtype})?",
            "Place {name} ({mtype}) into its proper mythological heritage.",
        ],
        "lm_rev": [
            "Which of these figures or beings appears in the lore of {tradition}?",
            "Journey into {tradition}: which mythic name here belongs to its tales?",
            "Identify the figure or creature rooted in {tradition}.",
            "Which legendary name on this slate belongs to {tradition}?",
        ],
        "lm_type": [
            "Within the myths of {tradition}, how is {name} classified?",
            "In the lore of {tradition}, what sort of mythic figure or being is {name}?",
            "Mythologists studying {tradition} categorize {name} as what kind of entity?",
            "What role or class of being does {name} embody in {tradition}?",
        ],
        "lm_tf": {
            "T": [
                "Comparative mythology places {name} ({mtype}) within {tradition}.",
                "In ancient lore, {name} ({mtype}) is part of {tradition}.",
                "Mythic archives assign {name} ({mtype}) to {tradition}.",
            ],
            "F": [
                "Comparative mythology places {name} ({mtype}) within {fake}.",
                "In ancient lore, {name} ({mtype}) is part of {fake}.",
                "Mythic archives assign {name} ({mtype}) to {fake}.",
            ],
        },
    },

    # ---------------- DOMAIN 11: LOGIC & MATH ----------------
    "math_person": {
        "mp_country": [
            "Born in {year}, {field} scholar {name} is linked to the intellectual tradition of which country?",
            "Which nation claims {field} thinker {name} (b. {year})?",
            "Trace the mathematical legacy of {name} ({field}, born {year}) to which country?",
            "In mathematical history, {field} figure {name} (b. {year}) is associated with which nation?",
        ],
        "mp_rev": [
            "Which of these mathematical or logical minds is linked to {country}?",
            "Scan the mathematical heritage of {country}: which scholar here belongs?",
            "Identify the mathematician or logician associated with {country}.",
            "Which thinker on this slate connects to the mathematical history of {country}?",
        ],
        "mp_tf": {
            "T": [
                "Mathematical histories associate {field} scholar {name} (born {year}) with {country}.",
                "Born in {year}, {field} thinker {name} is linked to {country}.",
                "Academic chronicles tie {name} ({field}, b. {year}) to {country}.",
            ],
            "F": [
                "Mathematical histories associate {field} scholar {name} (born {year}) with {fake}.",
                "Born in {year}, {field} thinker {name} is linked to {fake}.",
                "Academic chronicles tie {name} ({field}, b. {year}) to {fake}.",
            ],
        },
        "mp_year": [
            "Dial in the birth year of {field} scholar {name} ({country}).",
            "Which calendar year saw the birth of {country} {field} thinker {name}?",
            "When was {field} figure {name} ({country}) born?",
            "Pinpoint the birth year recorded for {name} ({field}, {country}).",
        ],
    },
    "math_num": {
        "mn_mc": [
            "Solve with precision: {stmt}?",
            "From the Meridian logic ledger: {stmt}?",
            "Compute the exact answer: {stmt}?",
            "Work out this mathematical challenge: {stmt}?",
        ],
        "mn_tf": {
            "T": [
                "Verify this {cat} calculation: {stmt}? Proposed answer: {ans}.",
                "Audit the {cat} ledger: {stmt}? Claimed value: {ans}.",
                "Test this {cat} statement: {stmt}? Result given: {ans}.",
            ],
            "F": [
                "Verify this {cat} calculation: {stmt}? Proposed answer: {fake}.",
                "Audit the {cat} ledger: {stmt}? Claimed value: {fake}.",
                "Test this {cat} statement: {stmt}? Result given: {fake}.",
            ],
        },
        "mn_est": [
            "Calibrate the exact mathematical value: {stmt}?",
            "Dial in the precise figure: {stmt}?",
            "Lock the vernier onto the answer: {stmt}?",
            "Compute and dial the result: {stmt}?",
        ],
    },
    "math_word": {
        "mw_mc": [
            "Crack this logic challenge: {stmt}?",
            "From the cipher desk: {stmt}?",
            "Deduce the exact solution: {stmt}?",
            "Work out the following puzzle: {stmt}?",
        ],
        "mw_tf": {
            "T": [
                "Verify this {cat} deduction: {stmt}? Proposed solution: {ans}.",
                "Audit the {cat} cipher: {stmt}? Claimed result: {ans}.",
                "Test this {cat} puzzle: {stmt}? Given solution: {ans}.",
            ],
            "F": [
                "Verify this {cat} deduction: {stmt}? Proposed solution: {fake}.",
                "Audit the {cat} cipher: {stmt}? Claimed result: {fake}.",
                "Test this {cat} puzzle: {stmt}? Given solution: {fake}.",
            ],
        },
    },
}


# =============================================================================
# 3. HAND-CRAFTED JEOPARDY / SPORTSWRITER `stemVariants` ACROSS ALL 33
#    SPECIALIST TABLE TYPES (126 ANGLES) IN `taxonomy_tree.json`
#
# Note: For the 7 existing `sub_bb_*` Baseball tables, `BASEBALL_PRIMARY_UPGRADE`
# replaces the dry database `prompt`/`truePrompt`/`falsePrompt` ITSELF with
# sportswriter copy AND sets `stemVariants[0] === prompt` (5 total variants!).
# =============================================================================

TAXONOMY_STEM_VARIANTS: Dict[str, Dict[str, Any]] = {
    # ---------------- BASEBALL SPECIALIST TABLES (`subcat_baseball.json`) ----------------
    "sub_bb_slugger": {
        "bbs_team": {
            "primary": "Debuting in the majors in {debut}, slugger {name} played the most games of their career in which MLB uniform?",
            "variants": [
                "Breaking into MLB in {debut}, power hitter {name} logged the plurality of their career games with which club?",
                "Recall the {debut} debut of {name}: which MLB franchise saw this slugger play the most career games?",
                "Across an MLB career starting in {debut}, which club was {name}'s primary baseball home?",
                "Which MLB ballclub fielded slugger {name} (MLB debut {debut}) for more games than any other franchise?",
            ],
        },
        "bbs_rev": {
            "primary": "Which of these MLB power hitters wore the uniform of the {team} for the plurality of their career games?",
            "variants": [
                "Scan the lineup card for the {team}: which of these sluggers played more games for them than any other club?",
                "Among these MLB home-run threats, who made the {team} their primary career ballclub?",
                "Which of these sluggers spent the largest share of their Major League career with the {team}?",
                "Which power bat here is most closely anchored to the {team} by career games played?",
            ],
        },
        "bbs_tf": {
            "T_primary": "Slugger {name} ({hr} career home runs) logged more MLB games for the {team} than for any other franchise.",
            "F_primary": "Slugger {name} ({hr} career home runs) logged more MLB games for the {fake} than for any other franchise.",
            "T": [
                "Across a {hr}-homer MLB career, {name} played primarily in the uniform of the {team}.",
                "Baseball-Reference career logs show {name} ({hr} HR) played their most MLB games with the {team}.",
                "Among all MLB clubs, the {team} fielded {hr}-homer slugger {name} for the most career games.",
            ],
            "F": [
                "Across a {hr}-homer MLB career, {name} played primarily in the uniform of the {fake}.",
                "Baseball-Reference career logs show {name} ({hr} HR) played their most MLB games with the {fake}.",
                "Among all MLB clubs, the {fake} fielded {hr}-homer slugger {name} for the most career games.",
            ],
        },
        "bbs_hr": {
            "primary": "Step into the batter's box: how many career MLB home runs did {name} ({team}) launch?",
            "variants": [
                "Dial in the career home run total slugged by {name} of the {team}.",
                "How many balls did {name} ({team}) send over Major League fences across their career?",
                "Pinpoint {name}'s ({team}) final career MLB home run ledger.",
                "Over a Major League career anchored with the {team}, how many homers did {name} belt?",
            ],
        },
        "bbs_cdx": {
            "primary": "Pair each MLB slugger on the upper ring with the franchise where they played the most career games.",
            "variants": [
                "Match each Major League power hitter above to their primary MLB club below.",
                "Align these baseball sluggers with the franchise uniform they wore most often.",
                "Lock each MLB hitter on the top dial onto their career home club below.",
                "Connect every big-league slugger above with their flagship MLB franchise.",
            ],
        },
    },
    "sub_bb_hits_rbi": {
        "bbh_team": {
            "primary": "Piling up {hits} career MLB base hits, {name} played more games for which franchise than any other?",
            "variants": [
                "Which MLB ballclub served as the primary career home for {hits}-hit standout {name}?",
                "Across a {hits}-hit Major League career, which club did {name} appear for most often?",
                "Check the box scores for {name} ({hits} career hits): which MLB franchise was their main uniform?",
                "With {hits} career MLB hits on the ledger, {name} logged their highest game total for which team?",
            ],
        },
        "bbh_tf": {
            "T_primary": "Racking up {hits} career hits, {name} played more MLB games for the {team} than any other club.",
            "F_primary": "Racking up {hits} career hits, {name} played more MLB games for the {fake} than any other club.",
            "T": [
                "MLB career records show {hits}-hit batter {name} played primarily for the {team}.",
                "During a {hits}-hit career, {name} spent their largest share of games with the {team}.",
                "The {team} served as the primary MLB home of {hits}-hit standout {name}.",
            ],
            "F": [
                "MLB career records show {hits}-hit batter {name} played primarily for the {fake}.",
                "During a {hits}-hit career, {name} spent their largest share of games with the {fake}.",
                "The {fake} served as the primary MLB home of {hits}-hit standout {name}.",
            ],
        },
        "bbh_hits": {
            "primary": "Check the career box score: how many Major League base hits did {name} ({team}) collect?",
            "variants": [
                "Dial in the lifetime MLB hit total posted by {name} of the {team}.",
                "How many career hits did {name} ({team}) notch across Major League play?",
                "Estimate the career hit ledger compiled by {name} ({team}).",
                "Lock onto {name}'s ({team}) final Major League career hit count.",
            ],
        },
        "bbh_rbi": {
            "primary": "How many career runs batted in (RBIs) did {name} ({team}) drive home in the majors?",
            "variants": [
                "Dial in the lifetime MLB RBI total credited to {name} of the {team}.",
                "Across their Major League career, how many runs did {name} ({team}) plate?",
                "Calibrate the career RBI mark tallied by {name} ({team}).",
                "How many runners did {name} ({team}) drive in across Major League Baseball?",
            ],
        },
    },
    "sub_bb_pitcher": {
        "bbp_team": {
            "primary": "Fanning {so} career MLB batters, pitcher {name} took the mound most often for which franchise?",
            "variants": [
                "With {so} Major League strikeouts on the ledger, which club served as {name}'s primary pitching home?",
                "Which MLB franchise saw hurler {name} ({so} career strikeouts) log the most career appearances?",
                "Across a {so}-strikeout pitching career, {name} wore which club's uniform most frequently?",
                "Toe the rubber with {name} ({so} career K's): which MLB ballclub was their main team?",
            ],
        },
        "bbp_rev": {
            "primary": "Which of these MLB pitchers made the plurality of their career appearances in the uniform of the {team}?",
            "variants": [
                "Scan the bullpen and rotation history of the {team}: which hurler here pitched primarily for them?",
                "Among these Major League arms, who logged more appearances for the {team} than any other club?",
                "Which pitcher on this slate made the {team} their primary career MLB franchise?",
                "Identify the MLB hurler whose longest career stint was with the {team}.",
            ],
        },
        "bbp_tf": {
            "T_primary": "Hurler {name} ({so} career strikeouts) logged more MLB appearances for the {team} than any other club.",
            "F_primary": "Hurler {name} ({so} career strikeouts) logged more MLB appearances for the {fake} than any other club.",
            "T": [
                "MLB pitching logs place {so}-strikeout arm {name} primarily with the {team}.",
                "Across a {so}-K career, pitcher {name} threw more games for the {team} than any rival club.",
                "The {team} served as the primary Major League club for {so}-strikeout pitcher {name}.",
            ],
            "F": [
                "MLB pitching logs place {so}-strikeout arm {name} primarily with the {fake}.",
                "Across a {so}-K career, pitcher {name} threw more games for the {fake} than any rival club.",
                "The {fake} served as the primary Major League club for {so}-strikeout pitcher {name}.",
            ],
        },
        "bbp_so": {
            "primary": "How many career Major League strikeouts did {name} ({team}) rack up on the mound?",
            "variants": [
                "Dial in the lifetime MLB strikeout total fanned by {name} of the {team}.",
                "How many batters did pitcher {name} ({team}) punch out across their MLB career?",
                "Estimate the career strikeout ledger posted by {name} ({team}).",
                "Calibrate the career K count recorded by {name} ({team}).",
            ],
        },
        "bbp_cdx": {
            "primary": "Match each MLB pitcher on the upper ring with the club where they pitched the most games.",
            "variants": [
                "Align each Major League hurler above to their flagship MLB franchise below.",
                "Pair these big-league arms with their primary career ballclub.",
                "Connect every MLB pitcher on the top dial to the club they pitched for most often.",
                "Lock each pitcher above onto their primary Major League uniform below.",
            ],
        },
    },
    "sub_bb_season_feat": {
        "bbf_plr": {
            "primary": "Which Major League standout authored this blistering single-season line: {feat}?",
            "variants": [
                "Open the single-season record book: who tore up baseball with {feat}?",
                "Which MLB star delivered the unforgettable campaign of {feat}?",
                "Credit for the single-season explosion {feat} belongs to which big-leaguer?",
                "Who electrified fans across baseball by posting {feat}?",
            ],
        },
        "bbf_team": {
            "primary": "Whose uniform was {player} wearing when lighting up baseball with {feat}?",
            "variants": [
                "Which MLB franchise benefited from {player}'s monster campaign of {feat}?",
                "For which ballclub did {player} produce the standout line of {feat}?",
                "On which team's roster did {player} post {feat}?",
                "Link {player}'s historic single-season outburst ({feat}) to the right MLB club.",
            ],
        },
        "bbf_tf": {
            "T_primary": "Playing for the {team}, {player} authored the single-season MLB mark of {feat}.",
            "F_primary": "Playing for the {team}, {fake} authored the single-season MLB mark of {feat}.",
            "T": [
                "Single-season MLB ledgers credit {player} of the {team} with {feat}.",
                "Wearing the {team} uniform, {player} delivered the campaign of {feat}.",
                "Baseball archives record {player} posting {feat} while playing for the {team}.",
            ],
            "F": [
                "Single-season MLB ledgers credit {fake} of the {team} with {feat}.",
                "Wearing the {team} uniform, {fake} delivered the campaign of {feat}.",
                "Baseball archives record {fake} posting {feat} while playing for the {team}.",
            ],
        },
    },
    "sub_bb_awards_hof": {
        "bba_plr": {
            "primary": "In {year}, which diamond luminary earned {honor}?",
            "variants": [
                "Turn the baseball calendar to {year}: who captured {honor}?",
                "Whose name was etched onto baseball's roll of honor in {year} for {honor}?",
                "Which MLB standout headlined {year} by earning {honor}?",
                "In the baseball annals of {year}, who claimed {honor}?",
            ],
        },
        "bba_tf": {
            "T_primary": "In {year}, {player} earned {honor}.",
            "F_primary": "In {year}, {fake} earned {honor}.",
            "T": [
                "Baseball's official {year} honors roll credits {player} with {honor}.",
                "In the {year} MLB record books, {player} claimed {honor}.",
                "The {year} baseball spotlight honored {player} with {honor}.",
            ],
            "F": [
                "Baseball's official {year} honors roll credits {fake} with {honor}.",
                "In the {year} MLB record books, {fake} claimed {honor}.",
                "The {year} baseball spotlight honored {fake} with {honor}.",
            ],
        },
        "bba_yr": {
            "primary": "In what year did {player} claim {honor}?",
            "variants": [
                "Set the baseball chronometer to the year {player} earned {honor}.",
                "Which calendar year saw {player} honored with {honor}?",
                "When did {player} capture {honor}?",
                "Pinpoint the exact year {player} achieved {honor}.",
            ],
        },
    },
    "sub_bb_world_series": {
        "bbw_win": {
            "primary": "Which franchise hoisted the World Series banner in the {series_lbl}, defeating the {loser}?",
            "variants": [
                "In the {series_lbl}, which ballclub toppled the {loser} to claim the Fall Classic crown?",
                "Who outlasted the {loser} to win the {series_lbl}?",
                "Which champion franchise celebrated over the {loser} at the end of the {series_lbl}?",
                "Relive October's {series_lbl}: which club vanquished the {loser} for the title?",
            ],
        },
        "bbw_lose": {
            "primary": "Which opposing ballclub fell to the {winner} in the {series_lbl}?",
            "variants": [
                "To capture the {series_lbl}, the {winner} had to get past which runner-up club?",
                "Which league champion came up short against the {winner} in the {series_lbl}?",
                "In the {series_lbl}, which team watched the {winner} clinch the championship?",
                "Identify the World Series opponent defeated by the {winner} in the {series_lbl}.",
            ],
        },
        "bbw_tf": {
            "T_primary": "The {winner} toppled the {loser} to capture the {series_lbl}.",
            "F_primary": "The {fake} toppled the {loser} to capture the {series_lbl}.",
            "T": [
                "Fall Classic history records the {winner} defeating the {loser} in the {series_lbl}.",
                "In the {series_lbl}, the {winner} edged past the {loser} for the championship.",
                "October glory in the {series_lbl} belonged to the {winner} over the {loser}.",
            ],
            "F": [
                "Fall Classic history records the {fake} defeating the {loser} in the {series_lbl}.",
                "In the {series_lbl}, the {fake} edged past the {loser} for the championship.",
                "October glory in the {series_lbl} belonged to the {fake} over the {loser}.",
            ],
        },
        "bbw_cdx": {
            "primary": "Pair each Fall Classic edition on the upper ring with the World Series champion below.",
            "variants": [
                "Align each World Series year above with the franchise that captured the crown.",
                "Match every October championship edition on the top dial with its title club.",
                "Connect each World Series series score above to the victorious ballclub below.",
                "Lock each Fall Classic edition onto the champion franchise that hoisted the trophy.",
            ],
        },
    },
    "sub_bb_ballpark": {
        "bbk_city": {
            "primary": "In which city did fans pass through the turnstiles of {park}?",
            "variants": [
                "Pin {park} onto the baseball atlas: which city is (or was) its home?",
                "Travel to watch a ballgame at {park} in which baseball city?",
                "Which city hosted Major League crowds inside {park}?",
                "Locate the storied diamond known as {park} in its proper city.",
            ],
        },
        "bbk_team": {
            "primary": "Which baseball franchise called the storied diamond of {park} its home ballpark?",
            "variants": [
                "Step onto the grass at {park}: which club took the field there as the home team?",
                "Which franchise played its home schedule inside {park}?",
                "Fans cheering at {park} rooted for which home ballclub?",
                "Identify the baseball club whose home diamond was {park}.",
            ],
        },
        "bbk_yr": {
            "primary": "In what year did {park} ({city}) first open its gates for the {team}?",
            "variants": [
                "Dial in the inaugural MLB season when {park} ({city}) debuted for the {team}.",
                "Which calendar year saw the {team} play their first home game at {park} ({city})?",
                "When did {park} in {city} first host Major League play for the {team}?",
                "Set the ballpark timeline to the opening year of {park} ({city}, {team}).",
            ],
        },
        "bbk_cdx": {
            "primary": "Pair each storied ballpark on the upper ring with the home franchise that played there.",
            "variants": [
                "Align each baseball stadium above to its home ballclub below.",
                "Match every MLB diamond on the top dial with its resident franchise.",
                "Connect each classic ballpark above to its home club below.",
                "Lock each ballpark name onto the franchise that called it home.",
            ],
        },
    },

    # ---------------- DOMAIN 0 SPECIALISTS ----------------
    "sub_hist_dynasty": {
        "shd_dyn": {
            "primary": "To which royal house or ruling lineage did {name} (b. {year}, {country}) belong?",
            "variants": [
                "Born in {year} in {country}, {name} carried the bloodline of which royal house?",
                "Which ruling house or noble lineage claimed {name} (b. {year}, {country})?",
                "Trace the aristocratic pedigree of {name} ({country}, born {year}) to which royal house?",
                "In the genealogies of {country}, {name} (b. {year}) belonged to which ruling house?",
            ],
        },
        "shd_rev": [
            "Scan the royal family tree of {dynasty}: which historical figure here belongs to it?",
            "Which ruler or noble on this slate hailed from {dynasty}?",
            "Identify the historical figure born into the lineage of {dynasty}.",
            "Which name here carried the banner of {dynasty}?",
        ],
        "shd_tf": {
            "T": [
                "Genealogical archives place {name} (born {year}) in {dynasty}.",
                "Born in {year}, {name} was a member of {dynasty}.",
                "Dynastic chronicles list {name} (b. {year}) within {dynasty}.",
            ],
            "F": [
                "Genealogical archives place {name} (born {year}) in {fake}.",
                "Born in {year}, {name} was a member of {fake}.",
                "Dynastic chronicles list {name} (b. {year}) within {fake}.",
            ],
        },
        "shd_yr": [
            "Dial in the birth year of {name} ({dynasty}, {country}).",
            "Which calendar year saw the birth of {name} of {dynasty} ({country})?",
            "When was {name} ({dynasty}, {country}) born?",
            "Pinpoint the birth year recorded for {name} ({dynasty}, {country}).",
        ],
        "shd_cdx": [
            "Match each historical ruler or noble on the top dial to their ruling dynasty below.",
            "Pair each royal figure above with their ancestral house or dynasty.",
            "Connect each monarch or noble to their dynastic lineage.",
            "Lock every historical royal above onto their proper house below.",
        ],
    },
    "sub_hist_arch_site": {
        "sha_cnt": [
            "Excavators uncovering the ruins of {name} work inside which modern nation?",
            "Pack a trowel for {name}: which present-day country hosts this archaeological site?",
            "On a modern heritage atlas, {name} lies within which country?",
            "Which contemporary country safeguards the historic site of {name}?",
        ],
        "sha_cul": [
            "Standing in {country}, the site of {name} preserves the legacy of which culture or civilization?",
            "Archaeologists in {country} link {name} to which ancient civilization or cultural period?",
            "Which historical culture left behind the remains of {name} in {country}?",
            "Uncover {name} in {country}: which civilization built or inhabited it?",
        ],
        "sha_tf": {
            "T": [
                "Archaeological surveys locate {name} inside present-day {country}.",
                "The heritage site of {name} lies within modern {country}.",
                "Excavation records place {name} in {country}.",
            ],
            "F": [
                "Archaeological surveys locate {name} inside present-day {fake}.",
                "The heritage site of {name} lies within modern {fake}.",
                "Excavation records place {name} in {fake}.",
            ],
        },
        "sha_cdx": [
            "Pair each ancient or archaeological site above with its present-day country below.",
            "Match each excavation site on the upper ring to its modern nation.",
            "Align these historic ruins with the countries where they stand today.",
            "Lock every archaeological landmark onto its modern country below.",
        ],
    },
    "sub_hist_figures_deep": {
        "shf_cnt": [
            "Born in {year} ({era_tag}), {name} is linked to the history of which country or realm?",
            "Which nation or realm claims {name} ({era_tag}, b. {year}) in its historical record?",
            "From the ledger of {era_tag}, {name} (born {year}) connects to which country?",
            "Trace {name} (b. {year}, {era_tag}) back to their associated realm or nation.",
        ],
        "shf_rev": [
            "From the era of {era_tag}, which of these figures belongs to the story of {country}?",
            "Spot the {era_tag} figure on this slate linked with {country}.",
            "Which historical name here ({era_tag}) connects directly to {country}?",
            "Identify the {era_tag} figure associated with {country}.",
        ],
        "shf_tf": {
            "T": [
                "Historical biographies tie {name} (born {year}) to {country}.",
                "Born in {year}, historical figure {name} belongs to the story of {country}.",
                "Archival records associate {name} (b. {year}) with {country}.",
            ],
            "F": [
                "Historical biographies tie {name} (born {year}) to {fake}.",
                "Born in {year}, historical figure {name} belongs to the story of {fake}.",
                "Archival records associate {name} (b. {year}) with {fake}.",
            ],
        },
        "shf_yr": [
            "Dial in the birth year of {name} ({country}).",
            "Which calendar year saw the birth of historical figure {name} ({country})?",
            "When was {name} of {country} born?",
            "Set the chronometer to the birth year of {name} ({country}).",
        ],
    },

    # ---------------- DOMAIN 1 SPECIALISTS ----------------
    "sub_sci_solar_body": {
        "ssb_disc": [
            "Spotted in {year}, the solar system body {name} ({btype}) was discovered by whom?",
            "Credit for finding the {year} {btype} {name} belongs to which astronomer or survey?",
            "In {year}, who charted the solar system object {name} ({btype})?",
            "Astronomical catalogs record which discoverer for {name} ({btype}, {year})?",
        ],
        "ssb_rev": [
            "Which of these solar system bodies was discovered by {discoverer}?",
            "Scan the observing log of {discoverer}: which object here did they uncover?",
            "Identify the minor planet, comet, or moon credited to {discoverer}.",
            "Which solar system discovery on this list belongs to {discoverer}?",
        ],
        "ssb_tf": {
            "T": [
                "Astronomical logs credit {discoverer} with finding {name} in {year}.",
                "In {year}, {discoverer} uncovered the solar system body {name}.",
                "The {year} discovery of {name} is attributed to {discoverer}.",
            ],
            "F": [
                "Astronomical logs credit {fake} with finding {name} in {year}.",
                "In {year}, {fake} uncovered the solar system body {name}.",
                "The {year} discovery of {name} is attributed to {fake}.",
            ],
        },
        "ssb_yr": [
            "Dial in the discovery year when {discoverer} spotted {name} ({btype}).",
            "Which calendar year saw {discoverer} find the {btype} {name}?",
            "When did {discoverer} discover {name} ({btype})?",
            "Pinpoint the year {name} ({btype}) was discovered by {discoverer}.",
        ],
    },
    "sub_sci_laureate": {
        "ssl_awd": [
            "An alumnus of {alma}, researcher {name} earned which prestigious scientific prize?",
            "Which major science honor crowns the career of {name} (educated at {alma})?",
            "From {alma} to global acclaim: which scientific award did {name} win?",
            "Identify the landmark scientific prize bestowed upon {name} ({alma}).",
        ],
        "ssl_alma": [
            "Before winning the honors of {award}, scientist {name} studied at which institution?",
            "Which university counts {award} laureate {name} among its alumni?",
            "Trace the academic training of {name} ({award}) to which alma mater?",
            "Where did {award} honoree {name} pursue university study?",
        ],
        "ssl_tf": {
            "T": [
                "Academic biographies record that scientist {name} (b. {year}) studied at {alma}.",
                "Born in {year}, researcher {name} counts {alma} as an alma mater.",
                "{name} (b. {year}) pursued scientific study at {alma}.",
            ],
            "F": [
                "Academic biographies record that scientist {name} (b. {year}) studied at {fake}.",
                "Born in {year}, researcher {name} counts {fake} as an alma mater.",
                "{name} (b. {year}) pursued scientific study at {fake}.",
            ],
        },
        "ssl_cdx": [
            "Match each celebrated scientist above with their university alma mater below.",
            "Pair each laureate on the upper ring with the institution where they studied.",
            "Connect these scientific pioneers to their academic homes.",
            "Lock every researcher above onto their proper alma mater below.",
        ],
    },
    "sub_sci_exo_deep": {
        "sxd_host": [
            "Lying roughly {dist_ly} light-years from Earth, exoplanet {name} circles which host star?",
            "Astronomers tracking exoplanet {name} (~{dist_ly} ly away) measure orbits around which star?",
            "Which parent star anchors the planetary system of {name} (~{dist_ly} light-years distant)?",
            "About {dist_ly} light-years out, {name} orbits which stellar host?",
        ],
        "sxd_orb": [
            "Dial in the approximate orbital period (in Earth days) of exoplanet {name}.",
            "Roughly how long is a single year on exoplanet {name}, measured in Earth days?",
            "Estimate how many Earth days {name} needs to complete one orbit around its star.",
            "Calibrate the orbital period of the extrasolar world {name} in Earth days.",
        ],
        "sxd_dist": [
            "Measure the cosmic gulf: roughly how many light-years away is exoplanet {name}?",
            "Dial in the approximate distance in light-years from Earth to {name}.",
            "How many light-years separate Earth from the exoplanet {name}?",
            "Estimate the stellar distance to exoplanet {name} in light-years.",
        ],
    },

    # ---------------- DOMAIN 2 SPECIALISTS ----------------
    "sub_geo_us_city": {
        "sgu_st": [
            "Home to roughly {pop_k},000 residents, the U.S. city of {name} sits inside which state?",
            "Cross into which American state to visit the city of {name} (pop. ~{pop_k},000)?",
            "On a U.S. road atlas, which state contains {name} (pop. ~{pop_k},000)?",
            "Which U.S. state encompasses the city of {name} (~{pop_k},000 people)?",
        ],
        "sgu_rev": [
            "Which of these U.S. cities sits inside the borders of {state}?",
            "Take a road trip across {state} to pass through which city here?",
            "Identify the American city located within {state}.",
            "Spot the city on this list belonging to {state}.",
        ],
        "sgu_tf": {
            "T": [
                "U.S. Census maps place the city of {name} inside {state}.",
                "Travelers find the American city of {name} in {state}.",
                "{name} is a municipality located within {state}.",
            ],
            "F": [
                "U.S. Census maps place the city of {name} inside {fake}.",
                "Travelers find the American city of {name} in {fake}.",
                "{name} is a municipality located within {fake}.",
            ],
        },
        "sgu_pop": [
            "Dial in the approximate resident population of {name}, {state}.",
            "Roughly how many people live in {name}, {state}?",
            "Estimate the census population of {name} in {state}.",
            "Calibrate the population gauge for {name}, {state}.",
        ],
        "sgu_cdx": [
            "Pair each U.S. city on the top ring with its home state below.",
            "Match these American municipalities to their proper states.",
            "Align each U.S. city above with the state that contains it.",
            "Lock every American city onto its corresponding state below.",
        ],
    },
    "sub_geo_city_deep": {
        "sgc_cnt": [
            "Locate the city of {name} on the world atlas: which nation encompasses it?",
            "Travelers arriving in {name} are landing in which country?",
            "Which sovereign country is home to the city of {name}?",
            "Locate {name} across the Meridian globe: which country claims it?",
        ],
        "sgc_reg": [
            "Zoom into {country}: which province, state, or region contains {name}?",
            "Inside {country}, {name} sits within which administrative region?",
            "Which subnational division of {country} encompasses the city of {name}?",
            "Locate {name} inside {country} by naming its region or province.",
        ],
        "sgc_tf": {
            "T": [
                "World gazetteers locate {name} ({region}) inside {country}.",
                "The city of {name} in {region} lies within {country}.",
                "Geography records place {name} ({region}) in {country}.",
            ],
            "F": [
                "World gazetteers locate {name} ({region}) inside {fake}.",
                "The city of {name} in {region} lies within {fake}.",
                "Geography records place {name} ({region}) in {fake}.",
            ],
        },
        "sgc_pop": [
            "Estimate the approximate population of {name}, {country}.",
            "Roughly how many inhabitants live in {name} ({country})?",
            "Dial in the population scale for {name}, {country}.",
            "Calibrate the urban population of {name} in {country}.",
        ],
    },

    # ---------------- DOMAIN 3 SPECIALISTS ----------------
    "sub_art_museum": {
        "sam_mus": [
            "To view {artist}'s {year} canvas \"{title}\" in person, buy a ticket to which museum?",
            "Which renowned gallery or museum holds \"{title}\" ({year}) by {artist}?",
            "Curators at which museum safeguard {artist}'s {year} work \"{title}\"?",
            "Where on the global museum map hangs \"{title}\" ({year}, {artist})?",
        ],
        "sam_art": [
            "Hanging at {museum}, the {year} painting \"{title}\" is the handiwork of which master?",
            "Step up to \"{title}\" ({year}) inside {museum}: which painter created it?",
            "Which artist painted \"{title}\" in {year}, now preserved at {museum}?",
            "Check the placard at {museum} beside \"{title}\" ({year}): who is the painter?",
        ],
        "sam_tf": {
            "T": [
                "Visitors to {museum} can see \"{title}\" ({year}) by {artist}.",
                "The {year} painting \"{title}\" by {artist} resides in the collection of {museum}.",
                "{museum} holds {artist}'s {year} work \"{title}\".",
            ],
            "F": [
                "Visitors to {fake} can see \"{title}\" ({year}) by {artist}.",
                "The {year} painting \"{title}\" by {artist} resides in the collection of {fake}.",
                "{fake} holds {artist}'s {year} work \"{title}\".",
            ],
        },
        "sam_cdx": [
            "Pair each museum masterwork on the upper ring with the institution holding it.",
            "Match every famed canvas above to its museum home below.",
            "Align these gallery masterpieces with the museums where they hang.",
            "Lock each painting onto the gallery that curates it.",
        ],
    },
    "sub_art_classical": {
        "sac_cmp": [
            "Take your seat in the concert hall: who composed \"{title}\" ({form}, {year})?",
            "Which classical master penned the {year} {form} \"{title}\"?",
            "Check the {year} score for \"{title}\" ({form}): which composer's name is on the cover?",
            "Musical archives attribute \"{title}\" ({form}, {year}) to which composer?",
        ],
        "sac_rev": [
            "Attend an all-{composer} concert evening: which work here belongs on the program?",
            "Which of these classical scores was written by {composer}?",
            "Identify the musical work composed by {composer}.",
            "Which title from this repertoire belongs to {composer}?",
        ],
        "sac_tf": {
            "T": [
                "Concert catalogs credit {composer} with the {year} work \"{title}\".",
                "In {year}, {composer} wrote the musical piece \"{title}\".",
                "The {year} score \"{title}\" comes from the pen of {composer}.",
            ],
            "F": [
                "Concert catalogs credit {fake} with the {year} work \"{title}\".",
                "In {year}, {fake} wrote the musical piece \"{title}\".",
                "The {year} score \"{title}\" comes from the pen of {fake}.",
            ],
        },
        "sac_yr": [
            "Dial in the year {composer} composed or premiered \"{title}\".",
            "Around which calendar year did {composer}'s \"{title}\" debut?",
            "When did {composer} write or premiere \"{title}\"?",
            "Pinpoint the premiere or composition year of \"{title}\" by {composer}.",
        ],
    },
    "sub_art_style": {
        "sas_sty": [
            "Study the facade of {name} ({country}, {year}): which architectural style defines it?",
            "Built in {country} ({year}), {name} exemplifies which architectural movement or style?",
            "Architectural historians place {name} ({country}, {year}) within which style?",
            "Which design idiom characterizes {name} ({country}, {year})?",
        ],
        "sas_cnt": [
            "Travel to admire the {year} architectural landmark {name} in which country?",
            "Which nation's heritage preserves {name} ({year})?",
            "On an architectural map of the world, {name} ({year}) stands in which country?",
            "Locate the {year} structure {name} inside which country?",
        ],
        "sas_tf": {
            "T": [
                "Architectural surveys classify {name} ({country}) under {style}.",
                "In {country}, the landmark {name} is an exemplar of {style} architecture.",
                "{name} ({country}) is a noted exemplar of {style}.",
            ],
            "F": [
                "Architectural surveys classify {name} ({country}) under {fake}.",
                "In {country}, the landmark {name} is an exemplar of {fake} architecture.",
                "{name} ({country}) is a noted exemplar of {fake}.",
            ],
        },
        "sas_cdx": [
            "Match each landmark on the upper ring to its signature architectural style below.",
            "Pair these iconic structures with the architectural movements they embody.",
            "Align each building above with its design style below.",
            "Lock every architectural landmark onto its corresponding style.",
        ],
    },

    # ---------------- DOMAIN 4 SPECIALISTS ----------------
    "sub_pop_actor": {
        "spa_cnt": [
            "Born in {year}, screen performer {name} hails from which country?",
            "Which nation claims screen actor {name} (b. {year})?",
            "Check the film bio of {name} (born {year}): which country is home?",
            "Which country's screen legacy includes {name} (b. {year})?",
        ],
        "spa_rev": [
            "Which of these screen actors hails from or represents {country}?",
            "Spot the cinema performer on this list linked to {country}.",
            "Identify the actor born in or associated with {country}.",
            "Which screen talent here connects to {country}?",
        ],
        "spa_tf": {
            "T": [
                "Cinema biographies associate screen actor {name} (born {year}) with {country}.",
                "Born in {year}, film performer {name} hails from {country}.",
                "Screen archives link actor {name} (b. {year}) to {country}.",
            ],
            "F": [
                "Cinema biographies associate screen actor {name} (born {year}) with {fake}.",
                "Born in {year}, film performer {name} hails from {fake}.",
                "Screen archives link actor {name} (b. {year}) to {fake}.",
            ],
        },
        "spa_yr": [
            "Dial in the birth year of screen actor {name} ({country}).",
            "Which calendar year saw the birth of screen performer {name} ({country})?",
            "When was actor {name} ({country}) born?",
            "Pinpoint the birth year recorded for {name} ({country}).",
        ],
    },

    # ---------------- DOMAIN 5 SPECIALISTS ----------------
    "sub_pro_player": {
        "spp_pos": [
            "Competing in {sport_tag} ({country}, b. {year}), {name} starred at which primary position?",
            "Check the lineup card for {sport_tag} player {name} ({country}, born {year}): what position did they play?",
            "In {sport_tag}, which role on the field or court belonged to {name} ({country}, b. {year})?",
            "Identify the primary playing position of {sport_tag} standout {name} ({country}, b. {year}).",
        ],
        "spp_cnt": [
            "Born in {year}, {sport_tag} {pos} {name} represented which country?",
            "Which nation's colors did {sport_tag} {pos} {name} (b. {year}) wear?",
            "Link {sport_tag} {pos} {name} (born {year}) to their home country.",
            "On international {sport_tag} rosters, {pos} {name} (b. {year}) hails from which nation?",
        ],
        "spp_tf": {
            "T": [
                "Pro {sport_tag} logs list {name} ({country}) primarily at {pos}.",
                "Representing {country} in {sport_tag}, {name} played mainly as {pos}.",
                "Scouting records place {sport_tag} player {name} ({country}) at {pos}.",
            ],
            "F": [
                "Pro {sport_tag} logs list {name} ({country}) primarily at {fake}.",
                "Representing {country} in {sport_tag}, {name} played mainly as {fake}.",
                "Scouting records place {sport_tag} player {name} ({country}) at {fake}.",
            ],
        },
        "spp_yr": [
            "Dial in the birth year of {sport_tag} {pos} {name} ({country}).",
            "Which calendar year saw the birth of {name} ({sport_tag}, {pos}, {country})?",
            "When was {country} {sport_tag} {pos} {name} born?",
            "Pinpoint the birth year recorded for {sport_tag} {pos} {name} ({country}).",
        ],
    },
    "sub_vg_genre": {
        "svg_gnr": [
            "Released by {dev} in {year}, \"{title}\" belongs to which video game genre?",
            "Pick up the controller for \"{title}\" ({year}, {dev}): what genre defines its gameplay?",
            "Gaming encyclopedias file {dev}'s {year} release \"{title}\" under which genre?",
            "Which interactive genre describes \"{title}\" ({year}) by {dev}?",
        ],
        "svg_dev2": [
            "Shipped in {year} in the {genre} arena, \"{title}\" was built by which studio?",
            "Which game developer created the {year} {genre} title \"{title}\"?",
            "Credit for the {year} {genre} release \"{title}\" belongs to which development house?",
            "Identify the studio behind \"{title}\" ({genre}, {year}).",
        ],
        "svg_tf2": {
            "T": [
                "Game catalogs classify {dev}'s {year} title \"{title}\" under {genre}.",
                "Released in {year} by {dev}, \"{title}\" is categorized in the {genre} genre.",
                "Players know \"{title}\" ({year}, {dev}) as part of the {genre} genre.",
            ],
            "F": [
                "Game catalogs classify {dev}'s {year} title \"{title}\" under {fake}.",
                "Released in {year} by {dev}, \"{title}\" is categorized in the {fake} genre.",
                "Players know \"{title}\" ({year}, {dev}) as part of the {fake} genre.",
            ],
        },
        "svg_cdx": [
            "Match each video game title above with the studio that developed it.",
            "Pair every game on the upper ring to its development house below.",
            "Align these playable classics with their creator studios.",
            "Lock each video game onto the developer that built it.",
        ],
    },

    # ---------------- DOMAIN 6 SPECIALISTS ----------------
    "sub_tech_aero_year": {
        "sta_mkr": [
            "Introduced in {year}, the {vclass} model {name} was engineered by which manufacturer?",
            "Step onto the hangar or factory floor of {year}: who built {name} ({vclass})?",
            "Which aerospace or vehicle maker produced {name} ({vclass}, {year})?",
            "Which company manufactured the {vclass} {name} (introduced {year})?",
        ],
        "sta_tf": {
            "T": [
                "Engineering registries credit {maker} with building {name} ({vclass}, {year}).",
                "In {year}, {maker} debuted the {vclass} {name} for service.",
                "Manufacturer {maker} produced the {year} {vclass} {name} on its line.",
            ],
            "F": [
                "Engineering registries credit {fake} with building {name} ({vclass}, {year}).",
                "In {year}, {fake} debuted the {vclass} {name} for service.",
                "Manufacturer {fake} produced the {year} {vclass} {name} on its line.",
            ],
        },
        "sta_yr": [
            "Dial in the debut or first-flight year of {name} ({maker}, {vclass}).",
            "Which calendar year saw {maker} debut the {vclass} {name}?",
            "When did {maker}'s {vclass} {name} first launch or fly?",
            "Set the engineering chronometer to the debut year of {name} ({maker}, {vclass}).",
        ],
        "sta_cdx": [
            "Pair each aircraft or vehicle on the upper ring with its manufacturer below.",
            "Match every engineering model above to the company that built it.",
            "Align these machines with their original makers.",
            "Lock each craft or vehicle onto its proper manufacturer.",
        ],
    },
    "sub_tech_format": {
        "stf_dev": [
            "Introduced in {year}, the {kind} standard {name} was created by which organization or developer?",
            "Who authored or launched {name} ({kind}) back in {year}?",
            "Trace the {year} {kind} specification {name} to its original creator or organization.",
            "Computing histories credit whom with creating {name} ({kind}, {year})?",
        ],
        "stf_tf": {
            "T": [
                "Technical archives credit {ext_or_dev} with creating {name} in {year}.",
                "In {year}, {ext_or_dev} introduced the computing standard {name} to developers.",
                "Records list {ext_or_dev} as developer of {name} ({year}).",
            ],
            "F": [
                "Technical archives credit {fake} with creating {name} in {year}.",
                "In {year}, {fake} introduced the computing standard {name} to developers.",
                "Records list {fake} as developer of {name} ({year}).",
            ],
        },
        "stf_yr": [
            "Dial in the launch year when {ext_or_dev} introduced {name} ({kind}).",
            "Which calendar year saw the debut of {name} ({kind}, {ext_or_dev})?",
            "When was {name} ({kind}) from {ext_or_dev} first introduced?",
            "Pinpoint the release year of {name} ({kind}, {ext_or_dev}).",
        ],
    },

    # ---------------- DOMAIN 7 SPECIALISTS ----------------
    "sub_nat_iucn": {
        "sni_sts": [
            "Check the global IUCN Red List: what conservation status applies to the {name} ({sci})?",
            "Biologists assessing the {name} ({sci}) assign it which IUCN Red List tier?",
            "Under IUCN conservation criteria, how is the {name} ({sci}) currently classified?",
            "Identify the official IUCN Red List risk level for the {name} ({sci}).",
        ],
        "sni_sci": [
            "In taxonomy guides for {group}, what Latin binomial identifies the {name}?",
            "Which scientific name corresponds to the {name} ({group})?",
            "Field biologists studying {group} catalog the {name} under which Latin name?",
            "Match the {name} ({group}) to its official binomial scientific name.",
        ],
        "sni_tf": {
            "T": [
                "IUCN conservation data places the {name} ({sci}) in the {status} tier.",
                "Wildlife assessments currently list the {name} ({sci}) as {status}.",
                "The {name} ({sci}) holds an IUCN Red List designation of {status}.",
            ],
            "F": [
                "IUCN conservation data places the {name} ({sci}) in the {fake} tier.",
                "Wildlife assessments currently list the {name} ({sci}) as {fake}.",
                "The {name} ({sci}) holds an IUCN Red List designation of {fake}.",
            ],
        },
        "sni_cdx": [
            "Match each species' common name above with its Latin scientific binomial below.",
            "Pair every organism on the top dial to its official scientific name.",
            "Align these wildlife entries with their taxonomic Latin names.",
            "Lock each common species name onto its proper binomial below.",
        ],
    },
    "sub_nat_breed": {
        "snb_cnt": [
            "Trace the lineage of the {name} ({animal}): which country developed this breed?",
            "Which nation is the traditional homeland of the {name} ({animal})?",
            "Breed registries trace the {name} ({animal}) back to which country?",
            "From which country does the {name} ({animal}) originate?",
        ],
        "snb_rev": [
            "Which of these {animal} breeds traces its roots to {country}?",
            "Scan the breed heritage of {country}: which {animal} here originated there?",
            "Identify the {animal} breed developed in {country}.",
            "Which {animal} breed on this slate hails from {country}?",
        ],
        "snb_tf": {
            "T": [
                "Breed histories place the origin of the {name} ({animal}) in {country}.",
                "The {name} ({animal}) was originally bred in {country}.",
                "Livestock and kennel registries trace the {name} ({animal}) to {country}.",
            ],
            "F": [
                "Breed histories place the origin of the {name} ({animal}) in {fake}.",
                "The {name} ({animal}) was originally bred in {fake}.",
                "Livestock and kennel registries trace the {name} ({animal}) to {fake}.",
            ],
        },
    },

    # ---------------- DOMAIN 8 SPECIALISTS ----------------
    "sub_soc_party_leader": {
        "ssp_pty": [
            "Active in {country} (b. {year}), political figure {name} aligned with which party?",
            "On the ballot of {country}, {name} (born {year}) represented which political party?",
            "Which political party claims {name} ({country}, b. {year}) among its leaders or members?",
            "Link {name} ({country}, b. {year}) to their primary political party.",
        ],
        "ssp_cnt": [
            "Born in {year}, statesman or politician {name} served in the political arena of which nation?",
            "Which country's legislative or executive history features {name} (b. {year})?",
            "Trace the political career of {name} (born {year}) to which country?",
            "In which nation's public affairs did {name} (b. {year}) hold office or influence?",
        ],
        "ssp_tf": {
            "T": [
                "Political archives in {country} link {name} to {party}.",
                "In {country}, {name} served under the banner of {party}.",
                "Electoral histories associate {name} ({country}) with {party}.",
            ],
            "F": [
                "Political archives in {country} link {name} to {fake}.",
                "In {country}, {name} served under the banner of {fake}.",
                "Electoral histories associate {name} ({country}) with {fake}.",
            ],
        },
        "ssp_yr": [
            "Dial in the birth year of {country} political figure {name} ({party}).",
            "Which calendar year saw the birth of {name} ({country}, {party})?",
            "When was {name} ({party}, {country}) born?",
            "Pinpoint the birth year on record for {name} ({country}, {party}).",
        ],
    },
    "sub_soc_law": {
        "sslw_cnt": [
            "Enacted or decided in {year}, {name} ({ltype}) belongs to which nation's legal history?",
            "Which country's courts or legislature produced {name} ({ltype}, {year})?",
            "Legal scholars tie the {year} {ltype} known as {name} to which jurisdiction?",
            "In {year}, {name} ({ltype}) shaped law within which country?",
        ],
        "sslw_tf": {
            "T": [
                "Legal annals place {name} ({ltype}, {year}) within the jurisdiction of {country}.",
                "The {year} {ltype} {name} belongs to the legal history of {country}.",
                "Jurisprudence archives connect {name} ({ltype}, {year}) with {country}.",
            ],
            "F": [
                "Legal annals place {name} ({ltype}, {year}) within the jurisdiction of {fake}.",
                "The {year} {ltype} {name} belongs to the legal history of {fake}.",
                "Jurisprudence archives connect {name} ({ltype}, {year}) with {fake}.",
            ],
        },
        "sslw_yr": [
            "Set the legal timeline to the year {name} ({country}, {ltype}) was enacted or ruled.",
            "Which calendar year marked the enactment or decision of {name} ({country}, {ltype})?",
            "When did {country} pass or decide {name} ({ltype})?",
            "Pinpoint the landmark year of {name} ({country}, {ltype}).",
        ],
    },

    # ---------------- DOMAIN 9 SPECIALISTS ----------------
    "sub_food_atelier": {
        "sfa_fnd": [
            "Established in {country} in {year}, the heritage house {name} was founded by whom?",
            "Which visionary founder launched {name} in {country} back in {year}?",
            "Trace the {year} birth of {country}'s {name} to its original founder.",
            "Whose entrepreneurial name stands behind the {year} founding of {name} ({country})?",
        ],
        "sfa_rev": [
            "In {year}, {founder} laid the cornerstone of which heritage house or company?",
            "Which enterprise on this list traces its {year} founding to {founder}?",
            "Step back to {year}: which brand or house did {founder} establish?",
            "Identify the house created by {founder} in {year}.",
        ],
        "sfa_tf": {
            "T": [
                "Corporate histories credit {founder} with establishing {name} ({country}, {year}).",
                "In {year}, {founder} launched {name} in {country}.",
                "Founding records list {founder} as creator of {name} ({country}, est. {year}).",
            ],
            "F": [
                "Corporate histories credit {fake} with establishing {name} ({country}, {year}).",
                "In {year}, {fake} launched {name} in {country}.",
                "Founding records list {fake} as creator of {name} ({country}, est. {year}).",
            ],
        },
        "sfa_cdx": [
            "Pair each heritage brand or atelier above with its original founder below.",
            "Match every craft or luxury house on the top ring to who founded it.",
            "Align these storied houses with their visionary founders.",
            "Lock each heritage house onto its proper founder below.",
        ],
    },
    "sub_food_ingred": {
        "sfi_ing": [
            "Step into a traditional {country} kitchen preparing {name}: which signature ingredient is central?",
            "Which key ingredient gives {country}'s {name} its classic character?",
            "Check the authentic recipe for {name} ({country}): which ingredient stands at its heart?",
            "Culinary guides highlight which essential ingredient inside {name} from {country}?",
        ],
        "sfi_cnt": [
            "Prepared traditionally with {ingred}, {name} hails from which country's culinary heritage?",
            "Which nation claims {name} (crafted with {ingred}) as a traditional specialty?",
            "Trace {name}, featuring {ingred}, back to its country of origin.",
            "On the global gastronomy map, {name} (made with {ingred}) belongs to which country?",
        ],
        "sfi_tf": {
            "T": [
                "Traditional {country} recipes for {name} highlight {ingred}.",
                "In {country}, authentic {name} is made with {ingred}.",
                "Culinary references list {ingred} as a signature component of {name} ({country}).",
            ],
            "F": [
                "Traditional {country} recipes for {name} highlight {fake}.",
                "In {country}, authentic {name} is made with {fake}.",
                "Culinary references list {fake} as a signature component of {name} ({country}).",
            ],
        },
    },

    # ---------------- DOMAIN 10 SPECIALISTS ----------------
    "sub_lit_char": {
        "slc_wrk": [
            "Created by {creator}, the fictional figure {name} steps off the pages of which work?",
            "In which story or work by {creator} do readers meet {name}?",
            "Open {creator}'s catalog: which work features the character {name}?",
            "Which title by {creator} introduces the character {name}?",
        ],
        "slc_crt": [
            "Appearing in \"{work}\", the character {name} sprang from the imagination of which creator?",
            "Which author or creator brought {name} to life inside \"{work}\"?",
            "Credit for inventing the character {name} (from \"{work}\") belongs to whom?",
            "Who wrote or created the character {name} of \"{work}\"?",
        ],
        "slc_tf": {
            "T": [
                "Literary archives credit {creator} with inventing {name} for \"{work}\".",
                "The character {name} in \"{work}\" is a creation of {creator}.",
                "{creator} brought the character {name} to life in \"{work}\".",
            ],
            "F": [
                "Literary archives credit {fake} with inventing {name} for \"{work}\".",
                "The character {name} in \"{work}\" is a creation of {fake}.",
                "{fake} brought the character {name} to life in \"{work}\".",
            ],
        },
        "slc_cdx": [
            "Match each literary or fictional character above to the creator who imagined them.",
            "Pair every character on the upper ring with their author or creator below.",
            "Align these storied characters with the writers who gave them life.",
            "Lock each fictional figure onto their creator below.",
        ],
    },
    "sub_lit_genre": {
        "slg_aut": [
            "Published in {year} within {genre}, \"{title}\" was written by which author?",
            "Pull the {year} {genre} title \"{title}\" off the shelf: who penned it?",
            "Which writer authored \"{title}\" ({genre}, {year})?",
            "Literary catalogs credit whom with the {year} {genre} work \"{title}\"?",
        ],
        "slg_gnr": [
            "Written by {author} in {year}, \"{title}\" sits on which genre shelf?",
            "Critics and booksellers file {author}'s {year} work \"{title}\" under which genre?",
            "Which literary genre best characterizes \"{title}\" ({year}) by {author}?",
            "How do readers classify {author}'s {year} book \"{title}\"?",
        ],
        "slg_tf": {
            "T": [
                "Publishing records credit {author} with the {year} {genre} work \"{title}\".",
                "In {year}, {author} published the {genre} book \"{title}\".",
                "Literary catalogs attribute \"{title}\" ({year}, {genre}) to {author} on record.",
            ],
            "F": [
                "Publishing records credit {fake} with the {year} {genre} work \"{title}\".",
                "In {year}, {fake} published the {genre} book \"{title}\".",
                "Literary catalogs attribute \"{title}\" ({year}, {genre}) to {fake} on record.",
            ],
        },
        "slg_yr": [
            "Dial in the publication year of {author}'s {genre} work \"{title}\".",
            "Which calendar year saw {author} publish \"{title}\" ({genre})?",
            "When did \"{title}\" ({genre}) by {author} first appear in print?",
            "Set the literary timeline to the year {author} debuted \"{title}\" ({genre}).",
        ],
    },

    # ---------------- DOMAIN 11 SPECIALISTS ----------------
    "sub_math_spec_num": {
        "smsn_mc": [
            "Compute with precision: {stmt}?",
            "From the specialist math vault: {stmt}?",
            "Solve the exact quantitative problem: {stmt}?",
            "Work out this exact figure: {stmt}?",
        ],
        "smsn_tf": {
            "T": [
                "Audit ({topic}): {stmt}? Proposed answer: {ans}.",
                "Check the {topic} ledger: {stmt}? Stated result: {ans}.",
                "Verify this {topic} equation: {stmt}? Claimed value: {ans}.",
            ],
            "F": [
                "Audit ({topic}): {stmt}? Proposed answer: {fake}.",
                "Check the {topic} ledger: {stmt}? Stated result: {fake}.",
                "Verify this {topic} equation: {stmt}? Claimed value: {fake}.",
            ],
        },
        "smsn_est": [
            "Calibrate the exact mathematical figure: {stmt}?",
            "Lock the vernier dial onto the result: {stmt}?",
            "Estimate and dial the precise value: {stmt}?",
            "Compute the exact numeric answer: {stmt}?",
        ],
    },
    "sub_math_spec_word": {
        "smsw_mc": [
            "Decode this specialist puzzle: {stmt}?",
            "From the cipher and logic desk: {stmt}?",
            "Deduce the exact solution: {stmt}?",
            "Work through this symbolic challenge: {stmt}?",
        ],
        "smsw_tf": {
            "T": [
                "Audit ({topic}): {stmt}? Proposed solution: {ans}.",
                "Check the {topic} deduction: {stmt}? Stated answer: {ans}.",
                "Verify this {topic} cipher: {stmt}? Claimed result: {ans}.",
            ],
            "F": [
                "Audit ({topic}): {stmt}? Proposed solution: {fake}.",
                "Check the {topic} deduction: {stmt}? Stated answer: {fake}.",
                "Verify this {topic} cipher: {stmt}? Claimed result: {fake}.",
            ],
        },
    },
}


# =============================================================================
# 4. LAHMAN ERA LOOKUP & BASEBALL SHARD UPGRADE ENGINE
# =============================================================================

def year_to_era_bucket(yr: int) -> str:
    if yr <= 1919:
        return "era_deadball_pre1920"
    if yr <= 1949:
        return "era_golden_1920_1949"
    if yr <= 1969:
        return "era_expansion_1950_1969"
    if yr <= 1989:
        return "era_turf_1970_1989"
    if yr <= 2009:
        return "era_power_1990_2009"
    return "era_statcast_2010_plus"


def load_lahman_player_debut_map() -> Tuple[Dict[str, List[Tuple[int, str]]], Dict[str, Tuple[int, int, int]], Dict[str, Tuple[int, int]]]:
    """
    Loads verified player debut years & career stat signatures from cached Lahman CSVs
    so duplicate player names (e.g. Ken Griffey Sr vs Jr) resolve to the exact right debut year!
    """
    name_to_ids: Dict[str, List[Tuple[int, str]]] = defaultdict(list)
    bat_totals: Dict[str, List[int]] = defaultdict(lambda: [0, 0, 0])  # HR, H, RBI
    pit_totals: Dict[str, List[int]] = defaultdict(lambda: [0, 0])     # SO, W

    people_csv = CACHE_DIR / "lahman_People.csv"
    if not people_csv.exists():
        return name_to_ids, {}, {}

    with people_csv.open("r", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            pid = (row.get("playerID") or "").strip()
            first = (row.get("nameFirst") or "").strip()
            last = (row.get("nameLast") or "").strip()
            deb = (row.get("debut") or "")[:4]
            if pid and first and last and deb.isdigit():
                full = f"{first} {last}".strip().lower()
                name_to_ids[full].append((int(deb), pid))

    bat_csv = CACHE_DIR / "lahman_Batting.csv"
    if bat_csv.exists():
        with bat_csv.open("r", encoding="utf-8", errors="replace") as f:
            for row in csv.DictReader(f):
                pid = (row.get("playerID") or "").strip()
                if not pid:
                    continue
                for idx, col in enumerate(("HR", "H", "RBI")):
                    v = row.get(col) or "0"
                    if v.isdigit():
                        bat_totals[pid][idx] += int(v)

    pit_csv = CACHE_DIR / "lahman_Pitching.csv"
    if pit_csv.exists():
        with pit_csv.open("r", encoding="utf-8", errors="replace") as f:
            for row in csv.DictReader(f):
                pid = (row.get("playerID") or "").strip()
                if not pid:
                    continue
                for idx, col in enumerate(("SO", "W")):
                    v = row.get(col) or "0"
                    if v.isdigit():
                        pit_totals[pid][idx] += int(v)

    bat_map = {k: (v[0], v[1], v[2]) for k, v in bat_totals.items()}
    pit_map = {k: (v[0], v[1]) for k, v in pit_totals.items()}
    return name_to_ids, bat_map, pit_map


def resolve_player_debut_year(
    name: str,
    team_name: str,
    stat_a: int,
    stat_b: int,
    is_pitcher: bool,
    name_to_ids: Dict[str, List[Tuple[int, str]]],
    bat_map: Dict[str, Tuple[int, int, int]],
    pit_map: Dict[str, Tuple[int, int]],
) -> int:
    cands = name_to_ids.get(name.strip().lower(), [])
    if len(cands) == 1:
        return cands[0][0]
    if len(cands) > 1:
        best_deb = cands[0][0]
        best_err = 10**9
        for deb, pid in cands:
            if is_pitcher:
                so, w = pit_map.get(pid, (0, 0))
                err = abs(so - stat_a) + abs(w - stat_b) * 10
            else:
                hr, h, rbi = bat_map.get(pid, (0, 0, 0))
                err = abs(h - stat_a) + abs(rbi - stat_b)
            if err < best_err:
                best_err = err
                best_deb = deb
        return best_deb

    # Deterministic fallback by franchise name if CSV cache is absent
    tl = team_name.lower()
    if any(k in tl for k in ("stockings", "spiders", "beaneaters", "highlanders", "superbas", "grooms", "americans", "wolverines", "bisons", "alleghenys", "maroons", "trojans", "quakers", "orphans")):
        return 1900
    if any(k in tl for k in ("diamondbacks", "rays", "rockies", "marlins", "nationals", "guardians")):
        return 2012
    return 1980


def clean_award_honor(honor: str, player: str, year: int) -> str:
    """
    Normalizes Lahman `sub_bb_awards_hof` honor labels into natural, factually exact noun phrases:
      - Fixes Lahman 2024 AL/NL Triple Crown swap (Chris Sale = NL Braves, Tarik Skubal = AL Tigers)
      - Distinguishes Batting vs Pitching Triple Crown
      - Formats Cooperstown inductions & annual awards cleanly with zero awkward articles.
    """
    s = honor.strip()
    s = re.sub(r"\s*\(winner debut \d{4}\)", "", s).strip()
    if s.startswith("ML "):
        s = "MLB " + s[3:]

    # Idempotent strip of prior normalization
    if s.startswith("the "):
        s = s[4:]
    if s.startswith("Cooperstown Hall of Fame induction "):
        return s

    if s.startswith("Cooperstown Hall of Fame "):
        rest = s[len("Cooperstown Hall of Fame "):]
        return f"Cooperstown Hall of Fame induction {rest}"

    if "Triple Crown" in s:
        if player == "Chris Sale" and year == 2024:
            return "the NL Pitching Triple Crown"
        if player == "Tarik Skubal" and year == 2024:
            return "the AL Pitching Triple Crown"
        if s.startswith("AL "):
            return "the AL Batting Triple Crown"
        if s.startswith("NL "):
            return "the NL Batting Triple Crown"
        return f"the {s}"

    return f"the {s}"


def ensure_pool_index(pool: List[str], value: str) -> int:
    try:
        return pool.index(value)
    except ValueError:
        pool.append(value)
        return len(pool) - 1


def upgrade_baseball_shard(
    bb_data: Dict[str, Any],
    tax_data: Dict[str, Any],
) -> Tuple[Dict[str, Any], Dict[str, Tuple[int, int]], int]:
    """
    Idempotently upgrades `subcat_baseball.json`:
      - Adds era buckets + `preferSameCol` across all 7 existing tables
      - Trims bottom obscure sub-340-SO pitchers (`len(SIGNATURE_DIAMOND_CLASSICS) // 5`)
        so adding 375 bespoke `sub_bb_signature_lore` rows preserves EXACT 34,033 QIDs
        (`1,100,000 .. 1,134,032`) with ZERO QID collision with `domain_subcats_0.json`!
      - Appends Table 7 `sub_bb_signature_lore` (`375` hand-crafted rows).
    Returns: (updated_bb_data, qid_ranges_by_type, total_entities)
    """
    assert len(SIGNATURE_DIAMOND_CLASSICS) % 5 == 0, (
        f"SIGNATURE_DIAMOND_CLASSICS count ({len(SIGNATURE_DIAMOND_CLASSICS)}) must be a multiple of 5!"
    )
    n_sig = len(SIGNATURE_DIAMOND_CLASSICS)
    pitcher_trim = n_sig // 5  # 375 // 5 = 75 -> 2100 - 75 = 2025 pitchers!
    target_pitcher_rows = 2100 - pitcher_trim

    pool: List[str] = list(bb_data["p"])
    tables_by_type: Dict[str, Dict[str, Any]] = {t["type"]: t for t in bb_data["t"]}
    name_to_ids, bat_map, pit_map = load_lahman_player_debut_map()

    new_tables: List[Dict[str, Any]] = []
    qid_ranges_by_type: Dict[str, Tuple[int, int]] = {}
    cur_qid = 1_100_000
    total_entities = 0

    # 1. sub_bb_slugger: cols = ["name", "team", "hr", "debut", "era", "irt"], poolCols = [1, 4]
    slug_rows_in = tables_by_type["sub_bb_slugger"]["r"]
    slug_rows_out: List[list] = []
    for r in slug_rows_in:
        name, team_idx, hr, debut = r[0], int(r[1]), int(r[2]), int(r[3])
        irt = int(r[-1])
        era_idx = ensure_pool_index(pool, year_to_era_bucket(debut))
        slug_rows_out.append([name, team_idx, hr, debut, era_idx, irt])
    # Sort Easy -> Hard by IRT, grouped by era inside each IRT band so radius=60 clusters contemporaries!
    slug_rows_out.sort(key=lambda x: (x[5], x[4], -x[2], x[0]))
    n_ang = len(tax_data["types"]["sub_bb_slugger"]["angles"])
    new_tables.append({"type": "sub_bb_slugger", "baseQid": cur_qid, "r": slug_rows_out})
    qid_ranges_by_type["sub_bb_slugger"] = (cur_qid, cur_qid + len(slug_rows_out) * n_ang - 1)
    cur_qid += len(slug_rows_out) * n_ang
    total_entities += len(slug_rows_out)

    # 2. sub_bb_hits_rbi: cols = ["name", "team", "hits", "rbi", "era", "irt"], poolCols = [1, 4]
    hits_rows_in = tables_by_type["sub_bb_hits_rbi"]["r"]
    hits_rows_out: List[list] = []
    for r in hits_rows_in:
        name, team_idx, hits, rbi = r[0], int(r[1]), int(r[2]), int(r[3])
        irt = int(r[-1])
        deb = resolve_player_debut_year(name, pool[team_idx], hits, rbi, False, name_to_ids, bat_map, pit_map)
        era_idx = ensure_pool_index(pool, year_to_era_bucket(deb))
        hits_rows_out.append([name, team_idx, hits, rbi, era_idx, irt])
    hits_rows_out.sort(key=lambda x: (x[5], x[4], -x[2], x[0]))
    n_ang = len(tax_data["types"]["sub_bb_hits_rbi"]["angles"])
    new_tables.append({"type": "sub_bb_hits_rbi", "baseQid": cur_qid, "r": hits_rows_out})
    qid_ranges_by_type["sub_bb_hits_rbi"] = (cur_qid, cur_qid + len(hits_rows_out) * n_ang - 1)
    cur_qid += len(hits_rows_out) * n_ang
    total_entities += len(hits_rows_out)

    # 3. sub_bb_pitcher: cols = ["name", "team", "so", "wins", "era", "irt"], poolCols = [1, 4]
    # Trim strictly by lowest career strikeouts (keeping top 2,025 pitchers!) so re-runs are 100% idempotent!
    pit_rows_in = tables_by_type["sub_bb_pitcher"]["r"]
    pit_parsed: List[Tuple[str, int, int, int, int]] = [
        (r[0], int(r[1]), int(r[2]), int(r[3]), int(r[-1])) for r in pit_rows_in
    ]
    pit_parsed.sort(key=lambda x: (-x[2], -x[3], x[0]))
    pit_kept = pit_parsed[:target_pitcher_rows]
    pit_rows_out: List[list] = []
    for name, team_idx, so, wins, irt in pit_kept:
        deb = resolve_player_debut_year(name, pool[team_idx], so, wins, True, name_to_ids, bat_map, pit_map)
        era_idx = ensure_pool_index(pool, year_to_era_bucket(deb))
        pit_rows_out.append([name, team_idx, so, wins, era_idx, irt])
    pit_rows_out.sort(key=lambda x: (x[5], x[4], -x[2], x[0]))
    n_ang = len(tax_data["types"]["sub_bb_pitcher"]["angles"])
    new_tables.append({"type": "sub_bb_pitcher", "baseQid": cur_qid, "r": pit_rows_out})
    qid_ranges_by_type["sub_bb_pitcher"] = (cur_qid, cur_qid + len(pit_rows_out) * n_ang - 1)
    cur_qid += len(pit_rows_out) * n_ang
    total_entities += len(pit_rows_out)

    # 4. sub_bb_season_feat: cols = ["feat", "player", "team", "val", "unit", "era", "irt"], poolCols = [2, 4, 5]
    sf_rows_in = tables_by_type["sub_bb_season_feat"]["r"]
    sf_rows_out: List[list] = []
    for r in sf_rows_in:
        feat, plr, team_idx, val, unit_idx = r[0], r[1], int(r[2]), int(r[3]), int(r[4])
        irt = int(r[-1])
        m_yr = re.match(r"(\d{4})", str(feat))
        yr = int(m_yr.group(1)) if m_yr else 1980
        unit_lbl = pool[unit_idx]
        if yr <= 1919:
            sb = f"{unit_lbl}_pre1920"
        elif yr <= 1969:
            sb = f"{unit_lbl}_1920_1969"
        elif yr <= 1994:
            sb = f"{unit_lbl}_1970_1994"
        else:
            sb = f"{unit_lbl}_1995_plus"
        era_idx = ensure_pool_index(pool, sb)
        sf_rows_out.append([feat, plr, team_idx, val, unit_idx, era_idx, irt])
    # Ensure every era bucket has >= 4 distinct players & teams (merge tiny buckets if any)
    sf_bucket_plrs: Dict[int, Set[str]] = defaultdict(set)
    sf_bucket_teams: Dict[int, Set[int]] = defaultdict(set)
    for row in sf_rows_out:
        sf_bucket_plrs[row[5]].add(row[1].lower())
        sf_bucket_teams[row[5]].add(row[2])
    for row in sf_rows_out:
        if len(sf_bucket_plrs[row[5]]) < 5 or len(sf_bucket_teams[row[5]]) < 5:
            # Coarsen to unit + modern/classic
            m_yr = re.match(r"(\d{4})", str(row[0]))
            yr = int(m_yr.group(1)) if m_yr else 1980
            unit_lbl = pool[row[4]]
            coarse = f"{unit_lbl}_modern" if yr >= 1970 else f"{unit_lbl}_classic"
            row[5] = ensure_pool_index(pool, coarse)
    sf_rows_out.sort(key=lambda x: (x[6], x[5], -x[3], x[0]))
    n_ang = len(tax_data["types"]["sub_bb_season_feat"]["angles"])
    new_tables.append({"type": "sub_bb_season_feat", "baseQid": cur_qid, "r": sf_rows_out})
    qid_ranges_by_type["sub_bb_season_feat"] = (cur_qid, cur_qid + len(sf_rows_out) * n_ang - 1)
    cur_qid += len(sf_rows_out) * n_ang
    total_entities += len(sf_rows_out)

    # 5. sub_bb_awards_hof: cols = ["honor", "player", "year", "era", "irt"], poolCols = [3]
    ah_rows_in = tables_by_type["sub_bb_awards_hof"]["r"]
    ah_rows_out: List[list] = []
    for r in ah_rows_in:
        honor_raw, plr, yr = r[0], r[1], int(r[2])
        irt = int(r[-1])
        honor = clean_award_honor(honor_raw, plr, yr)
        if "Cooperstown" in honor:
            era_lbl = "hof_modern_2000_plus" if yr >= 2000 else "hof_classic_pre2000"
        elif yr >= 2010:
            era_lbl = "awd_2010_plus"
        elif yr >= 1990:
            era_lbl = "awd_1990_2009"
        elif yr >= 1970:
            era_lbl = "awd_1970_1989"
        elif yr >= 1950:
            era_lbl = "awd_1950_1969"
        else:
            era_lbl = "awd_pre1950"
        era_idx = ensure_pool_index(pool, era_lbl)
        ah_rows_out.append([honor, plr, yr, era_idx, irt])
    ah_rows_out.sort(key=lambda x: (x[4], x[3], -x[2], x[1]))
    n_ang = len(tax_data["types"]["sub_bb_awards_hof"]["angles"])
    new_tables.append({"type": "sub_bb_awards_hof", "baseQid": cur_qid, "r": ah_rows_out})
    qid_ranges_by_type["sub_bb_awards_hof"] = (cur_qid, cur_qid + len(ah_rows_out) * n_ang - 1)
    cur_qid += len(ah_rows_out) * n_ang
    total_entities += len(ah_rows_out)

    # 6. sub_bb_world_series: cols = ["series_lbl", "winner", "loser", "year", "era", "irt"], poolCols = [1, 2, 4]
    ws_rows_in = tables_by_type["sub_bb_world_series"]["r"]
    ws_rows_out: List[list] = []
    for r in ws_rows_in:
        lbl, w_idx, l_idx, yr = r[0], int(r[1]), int(r[2]), int(r[3])
        irt = int(r[-1])
        if yr >= 2000:
            ws_era = "ws_modern_2000_plus"
        elif yr >= 1960:
            ws_era = "ws_expansion_1960_1999"
        else:
            ws_era = "ws_classic_pre1960"
        era_idx = ensure_pool_index(pool, ws_era)
        ws_rows_out.append([lbl, w_idx, l_idx, yr, era_idx, irt])
    ws_rows_out.sort(key=lambda x: (-x[3],))
    n_ang = len(tax_data["types"]["sub_bb_world_series"]["angles"])
    new_tables.append({"type": "sub_bb_world_series", "baseQid": cur_qid, "r": ws_rows_out})
    qid_ranges_by_type["sub_bb_world_series"] = (cur_qid, cur_qid + len(ws_rows_out) * n_ang - 1)
    cur_qid += len(ws_rows_out) * n_ang
    total_entities += len(ws_rows_out)

    # 7. sub_bb_ballpark: cols = ["park", "city", "team", "year", "era", "irt"], poolCols = [1, 2, 4]
    pk_rows_in = tables_by_type["sub_bb_ballpark"]["r"]
    pk_rows_out: List[list] = []
    negro_league_teams = {
        "chicago leland giants", "brooklyn royal giants", "west baden sprudels",
        "kansas city royal giants", "new york lincoln giants", "harrisburg giants",
        "new york lincoln stars", "indianapolis abcs", "hilldale club",
        "atlantic city bacharach giants", "detroit stars", "kansas city monarchs",
        "baltimore black sox", "st. louis stars", "birmingham black barons",
        "memphis red sox", "nashville elite giants", "pittsburgh crawfords",
        "homestead grays", "baltimore elite giants", "new york black yankees",
        "philadelphia stars", "chicago american giants",
    }
    for r in pk_rows_in:
        park, c_idx, t_idx, yr = r[0], int(r[1]), int(r[2]), int(r[3])
        irt = int(r[-1])
        t_low = pool[t_idx].lower()
        if t_low in negro_league_teams:
            pk_era = "park_negro_leagues"
        elif yr >= 1995:
            pk_era = "park_modern_1995_plus"
        elif yr >= 1953:
            pk_era = "park_midcentury_1953_1994"
        else:
            pk_era = "park_classic_pre1953"
        era_idx = ensure_pool_index(pool, pk_era)
        pk_rows_out.append([park, c_idx, t_idx, yr, era_idx, irt])
    pk_rows_out.sort(key=lambda x: (x[5], x[4], x[3], x[0]))
    n_ang = len(tax_data["types"]["sub_bb_ballpark"]["angles"])
    new_tables.append({"type": "sub_bb_ballpark", "baseQid": cur_qid, "r": pk_rows_out})
    qid_ranges_by_type["sub_bb_ballpark"] = (cur_qid, cur_qid + len(pk_rows_out) * n_ang - 1)
    cur_qid += len(pk_rows_out) * n_ang
    total_entities += len(pk_rows_out)

    # 8. sub_bb_signature_lore: 375 hand-crafted Jeopardy / sportswriter classics!
    # cols = ["slug", "theme", "prompt", "answer", "d1", "d2", "d3", "clue1", "clue2", "why", "irt"], poolCols = [1]
    sig_rows_out: List[list] = []
    for slug, theme, prompt, ans, d1, d2, d3, c1, c2, why, irt in SIGNATURE_DIAMOND_CLASSICS:
        th_idx = ensure_pool_index(pool, theme)
        sig_rows_out.append([slug, th_idx, prompt, ans, d1, d2, d3, c1, c2, why, int(irt)])
    sig_rows_out.sort(key=lambda x: (x[10], x[0]))
    new_tables.append({"type": "sub_bb_signature_lore", "baseQid": cur_qid, "r": sig_rows_out})
    qid_ranges_by_type["sub_bb_signature_lore"] = (cur_qid, cur_qid + len(sig_rows_out) - 1)
    cur_qid += len(sig_rows_out)
    total_entities += len(sig_rows_out)

    assert cur_qid - 1 == 1_134_032, (
        f"Expected contiguous QID end 1,134,032, got {cur_qid - 1:,}!"
    )

    updated = {
        "v": bb_data.get("v", 1),
        "d": 5,
        "p": pool,
        "t": new_tables,
    }
    return updated, qid_ranges_by_type, total_entities


def apply_stem_variants_to_spec(
    tid: str,
    spec: Dict[str, Any],
    variant_map: Dict[str, Any],
) -> int:
    """Applies `stemVariants` (and `truePromptVariants`/`falsePromptVariants`) to every angle of a table spec."""
    updated = 0
    for ang in spec["angles"]:
        aid = ang["id"]
        if aid not in variant_map:
            raise KeyError(f"Missing stemVariants definition for {tid}.{aid}!")
        cfg = variant_map[aid]
        arch = ang["archetype"]
        if arch == "GAUNTLET_SHATTER":
            if "T_primary" in cfg:
                ang["truePrompt"] = cfg["T_primary"]
                ang["falsePrompt"] = cfg["F_primary"]
            t_list = [ang["truePrompt"]] + list(cfg["T"])
            f_list = [ang["falsePrompt"]] + list(cfg["F"])
            assert len(t_list) == len(f_list) and len(t_list) >= 4, f"Bad TF variants on {tid}.{aid}"
            ang["truePromptVariants"] = t_list
            ang["falsePromptVariants"] = f_list
            updated += 1
        else:
            if isinstance(cfg, dict):
                ang["prompt"] = cfg["primary"]
                v_list = [ang["prompt"]] + list(cfg["variants"])
            else:
                v_list = [ang["prompt"]] + list(cfg)
            assert len(v_list) >= 4, f"Need >=4 stemVariants on {tid}.{aid}"
            ang["stemVariants"] = v_list
            updated += 1
    return updated


def update_baseball_table_specs_in_taxonomy(tax_data: Dict[str, Any]) -> None:
    """Updates baseball `cols`, `poolCols`, `preferSameCol`, `maxClamp`, and registers `sub_bb_signature_lore`."""
    types = tax_data["types"]

    # sub_bb_slugger
    s = types["sub_bb_slugger"]
    s["cols"] = ["name", "team", "hr", "debut", "era", "irt"]
    s["poolCols"] = [1, 4]
    for a in s["angles"]:
        if a["id"] in ("bbs_team", "bbs_rev"):
            a["preferSameCol"] = 4

    # sub_bb_hits_rbi
    s = types["sub_bb_hits_rbi"]
    s["cols"] = ["name", "team", "hits", "rbi", "era", "irt"]
    s["poolCols"] = [1, 4]
    for a in s["angles"]:
        if a["id"] == "bbh_team":
            a["preferSameCol"] = 4

    # sub_bb_pitcher
    s = types["sub_bb_pitcher"]
    s["cols"] = ["name", "team", "so", "wins", "era", "irt"]
    s["poolCols"] = [1, 4]
    for a in s["angles"]:
        if a["id"] in ("bbp_team", "bbp_rev"):
            a["preferSameCol"] = 4

    # sub_bb_season_feat
    s = types["sub_bb_season_feat"]
    s["cols"] = ["feat", "player", "team", "val", "unit", "era", "irt"]
    s["poolCols"] = [2, 4, 5]
    for a in s["angles"]:
        if a["id"] in ("bbf_plr", "bbf_team"):
            a["preferSameCol"] = 5

    # sub_bb_awards_hof
    s = types["sub_bb_awards_hof"]
    s["cols"] = ["honor", "player", "year", "era", "irt"]
    s["poolCols"] = [3]
    for a in s["angles"]:
        if a["id"] == "bba_plr":
            a["preferSameCol"] = 3
        elif a["id"] == "bba_yr":
            a["maxClamp"] = 2027
            a["clue1"] = "Baseball honor: {honor} ({player})."

    # sub_bb_world_series
    s = types["sub_bb_world_series"]
    s["cols"] = ["series_lbl", "winner", "loser", "year", "era", "irt"]
    s["poolCols"] = [1, 2, 4]
    for a in s["angles"]:
        if a["id"] in ("bbw_win", "bbw_lose"):
            a["preferSameCol"] = 4

    # sub_bb_ballpark
    s = types["sub_bb_ballpark"]
    s["cols"] = ["park", "city", "team", "year", "era", "irt"]
    s["poolCols"] = [1, 2, 4]
    for a in s["angles"]:
        if a["id"] == "bbk_city":
            a["preferSameCol"] = 4
            a["clue1"] = "First opened its gates to Major League play in {year}."
        elif a["id"] == "bbk_team":
            a["preferSameCol"] = 4
            a["clue1"] = "First hosted Major League baseball in {year}."
        elif a["id"] == "bbk_yr":
            a["maxClamp"] = 2026

    # Register bespoke sub_bb_signature_lore table spec!
    types["sub_bb_signature_lore"] = {
        "l0Domain": 5,
        "l1Category": "Baseball",
        "glyphHint": "star",
        "cols": ["slug", "theme", "prompt", "answer", "d1", "d2", "d3", "clue1", "clue2", "why", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "bbsl_lore",
                "archetype": "SIGHTLINE_LOCK",
                "prompt": "{prompt}",
                "stemVariants": ["{prompt}"],
                "answerCol": 3,
                "distractorCol": 3,
                "inlineDistCols": [4, 5, 6],
                "clue1": "{clue1}",
                "clue2": "{clue2}",
                "why": "{why}",
                "irtOffset": 0.0,
            }
        ],
    }


def update_taxonomy_metadata(
    tax_data: Dict[str, Any],
    bb_bytes: int,
    bb_entities: int,
    qid_ranges_by_type: Dict[str, Tuple[int, int]],
) -> None:
    """Syncs exact byte counts, entity counts, QID ranges, and weighted `sub_bb_signature_lore` rules."""
    # 1. subcatFiles["5"][0] -> subcat_baseball.json
    for entry in tax_data["subcatFiles"]["5"]:
        if entry["path"] == "subcat_baseball.json":
            entry["bytes"] = bb_bytes
            entry["entities"] = bb_entities
            entry["questions"] = 34033
            entry["baseQid"] = 1100000
            entry["qidEnd"] = 1134032
            entry["types"] = [
                "sub_bb_slugger",
                "sub_bb_hits_rbi",
                "sub_bb_pitcher",
                "sub_bb_season_feat",
                "sub_bb_awards_hof",
                "sub_bb_world_series",
                "sub_bb_ballpark",
                "sub_bb_signature_lore",
            ]

    # 2. Update L2 Baseball, Stadiums, and World Series Lore nodes in domain 5
    d5 = next(d for d in tax_data["domains"] if d["l0Domain"] == 5)
    for l1 in d5["l1Subcategories"]:
        for l2 in l1["l2Topics"]:
            if l2["id"] == "sports_baseball":
                l2["shardFiles"] = ["subcat_baseball.json"]
                l2["shardRules"] = [
                    {"type": "sub_bb_signature_lore", "filterCol": 1, "filterValues": ["IMMORTALS"], "allowedAngleIds": ["bbsl_lore"]},
                    {"type": "sub_bb_signature_lore", "filterCol": 1, "filterValues": ["OCTOBER_DRAMA"], "allowedAngleIds": ["bbsl_lore"]},
                    {"type": "sub_bb_signature_lore", "filterCol": 1, "filterValues": ["RECORDS_FEATS"], "allowedAngleIds": ["bbsl_lore"]},
                    {"type": "sub_bb_signature_lore", "filterCol": 1, "filterValues": ["DIAMOND_CULTURE"], "allowedAngleIds": ["bbsl_lore"]},
                    {"type": "sub_bb_slugger"},
                    {"type": "sub_bb_hits_rbi"},
                    {"type": "sub_bb_pitcher"},
                    {"type": "sub_bb_season_feat"},
                    {"type": "sub_bb_awards_hof"},
                    {"type": "sub_bb_world_series"},
                    {"type": "sub_bb_ballpark"},
                    {
                        "type": "sport_athlete",
                        "filterCol": 1,
                        "filterValues": ["Baseball"],
                        "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"],
                    },
                    {
                        "type": "sport_club",
                        "filterCol": 3,
                        "filterValues": ["Baseball"],
                        "allowedAngleIds": ["spc_country", "spc_year"],
                    },
                ]
                l2["questionCount"] = 34283
                l2["verifiedCount"] = 34283
                l2["qidRanges"] = [
                    list(qid_ranges_by_type[t])
                    for t in (
                        "sub_bb_slugger",
                        "sub_bb_hits_rbi",
                        "sub_bb_pitcher",
                        "sub_bb_season_feat",
                        "sub_bb_awards_hof",
                        "sub_bb_world_series",
                        "sub_bb_ballpark",
                        "sub_bb_signature_lore",
                    )
                ]
            elif l2["id"] == "sports_stadiums_arenas":
                l2["qidRanges"] = [
                    [609527, 615126],
                    list(qid_ranges_by_type["sub_bb_ballpark"]),
                ]
            elif l2["id"] == "sports_world_series_mlb_lore":
                l2["shardFiles"] = ["subcat_baseball.json"]
                l2["shardRules"] = [
                    {"type": "sub_bb_signature_lore", "filterCol": 1, "filterValues": ["OCTOBER_DRAMA"], "allowedAngleIds": ["bbsl_lore"]},
                    {"type": "sub_bb_signature_lore", "filterCol": 1, "filterValues": ["IMMORTALS"], "allowedAngleIds": ["bbsl_lore"]},
                    {"type": "sub_bb_world_series"},
                    {"type": "sub_bb_awards_hof"},
                    {"type": "sub_bb_season_feat"},
                ]
                lore_qs = (
                    (qid_ranges_by_type["sub_bb_world_series"][1] - qid_ranges_by_type["sub_bb_world_series"][0] + 1)
                    + (qid_ranges_by_type["sub_bb_awards_hof"][1] - qid_ranges_by_type["sub_bb_awards_hof"][0] + 1)
                    + (qid_ranges_by_type["sub_bb_season_feat"][1] - qid_ranges_by_type["sub_bb_season_feat"][0] + 1)
                    + (qid_ranges_by_type["sub_bb_signature_lore"][1] - qid_ranges_by_type["sub_bb_signature_lore"][0] + 1)
                )
                l2["questionCount"] = lore_qs
                l2["verifiedCount"] = lore_qs
                l2["qidRanges"] = [
                    list(qid_ranges_by_type["sub_bb_world_series"]),
                    list(qid_ranges_by_type["sub_bb_awards_hof"]),
                    list(qid_ranges_by_type["sub_bb_season_feat"]),
                    list(qid_ranges_by_type["sub_bb_signature_lore"]),
                ]


# =============================================================================
# 5. EXHAUSTIVE VERIFIER (ALL 26 SHARDS x ALL VARIANTS x ALL 375 BASEBALL LORE)
# =============================================================================

PLACEHOLDER_RE = re.compile(r"\{([a-zA-Z0-9_]+)\}")
RE_A_VOWEL = re.compile(r"\b([Aa]) ([AEIOUaeiou][a-zA-Z-]{2,})\b")
RE_A_VOWEL_SAFE = re.compile(
    r"^(?:uni|use|usu|utens|util|uro|uran|uter|utah|ugand|ukrain|uruguay|eup|eur|euk|eul|euth|eugl|one|once|ouija|ufo|usa|usb|url|uber|utopi|ukulel|unanim|ubiquit|unicorn|uniform|union|uniqu|unit|univers|usurp|ewe|one-|u-|un-|and|or|are|is|in|on|at|of|as|if|up|out|off|into|over|under|after|about|against|along|among|around|across|also|already|always|away|either|else|equals|equal)",
    re.I,
)
RE_BAD_PUNCT = re.compile(r"(?<!\.|\d)\.\.(?!\.|\d)|\?\?|,,|,\.(?!\.)|:\?|;\?|\?\.|\s+[?!,;:]")
RE_DOUBLE_WORD = re.compile(r"\b(the|in|of|is|to|at|for|on|with|from|by|was|were|are|a|an)\s+\1\b", re.I)


def is_valid_display_text(s: str) -> bool:
    for ch in s:
        cp = ord(ch)
        if 32 <= cp <= 126 or ch in ALLOWED_EXTRA_CHARS:
            continue
        return False
    return True


def verify_all() -> int:
    errors: List[str] = []
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    tax = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    bb = json.loads(BASEBALL_SHARD_PATH.read_text(encoding="utf-8"))

    all_types = {**manifest["types"], **tax["types"]}

    # 1. Verify EVERY angle in shard_manifest.json (45 types) & taxonomy_tree.json (34 types)
    manifest_angle_count = 0
    manifest_variant_count = 0
    for tid, spec in manifest["types"].items():
        for ang in spec["angles"]:
            manifest_angle_count += 1
            arch = ang["archetype"]
            if arch == "GAUNTLET_SHATTER":
                tv = ang.get("truePromptVariants") or []
                fv = ang.get("falsePromptVariants") or []
                if len(tv) < 4 or len(fv) < 4 or len(tv) != len(fv):
                    errors.append(f"manifest:{tid}.{ang['id']} missing/unbalanced TF variants ({len(tv)}/{len(fv)})")
                if tv and tv[0] != ang["truePrompt"]:
                    errors.append(f"manifest:{tid}.{ang['id']} truePromptVariants[0] != truePrompt")
                if fv and fv[0] != ang["falsePrompt"]:
                    errors.append(f"manifest:{tid}.{ang['id']} falsePromptVariants[0] != falsePrompt")
                base_t_ph = set(PLACEHOLDER_RE.findall(ang["truePrompt"]))
                base_f_ph = set(PLACEHOLDER_RE.findall(ang["falsePrompt"]))
                for v in tv:
                    manifest_variant_count += 1
                    if set(PLACEHOLDER_RE.findall(v)) != base_t_ph:
                        errors.append(f"manifest:{tid}.{ang['id']} T placeholder mismatch: {v}")
                    if not is_valid_display_text(v):
                        errors.append(f"manifest:{tid}.{ang['id']} invalid char in T: {v!r}")
                for v in fv:
                    if set(PLACEHOLDER_RE.findall(v)) != base_f_ph:
                        errors.append(f"manifest:{tid}.{ang['id']} F placeholder mismatch: {v}")
                    if not is_valid_display_text(v):
                        errors.append(f"manifest:{tid}.{ang['id']} invalid char in F: {v!r}")
            else:
                sv = ang.get("stemVariants") or []
                if len(sv) < 4:
                    errors.append(f"manifest:{tid}.{ang['id']} has <4 stemVariants ({len(sv)})")
                if sv and sv[0] != ang["prompt"]:
                    errors.append(f"manifest:{tid}.{ang['id']} stemVariants[0] != prompt")
                base_ph = set(PLACEHOLDER_RE.findall(ang["prompt"]))
                for v in sv:
                    manifest_variant_count += 1
                    if set(PLACEHOLDER_RE.findall(v)) != base_ph:
                        errors.append(f"manifest:{tid}.{ang['id']} placeholder mismatch: {v}")
                    if not is_valid_display_text(v):
                        errors.append(f"manifest:{tid}.{ang['id']} invalid char: {v!r}")

    tax_angle_count = 0
    tax_variant_count = 0
    for tid, spec in tax["types"].items():
        for ang in spec["angles"]:
            tax_angle_count += 1
            arch = ang["archetype"]
            if tid == "sub_bb_signature_lore":
                sv = ang.get("stemVariants") or []
                if sv != ["{prompt}"]:
                    errors.append(f"tax:{tid}.{ang['id']} unexpected stemVariants: {sv}")
                tax_variant_count += 1
                continue
            if arch == "GAUNTLET_SHATTER":
                tv = ang.get("truePromptVariants") or []
                fv = ang.get("falsePromptVariants") or []
                if len(tv) < 4 or len(fv) < 4 or len(tv) != len(fv):
                    errors.append(f"tax:{tid}.{ang['id']} missing/unbalanced TF variants")
                base_t_ph = set(PLACEHOLDER_RE.findall(ang["truePrompt"]))
                base_f_ph = set(PLACEHOLDER_RE.findall(ang["falsePrompt"]))
                for v in tv:
                    tax_variant_count += 1
                    if set(PLACEHOLDER_RE.findall(v)) != base_t_ph:
                        errors.append(f"tax:{tid}.{ang['id']} T placeholder mismatch: {v}")
                    if not is_valid_display_text(v):
                        errors.append(f"tax:{tid}.{ang['id']} invalid char in T: {v!r}")
                for v in fv:
                    if set(PLACEHOLDER_RE.findall(v)) != base_f_ph:
                        errors.append(f"tax:{tid}.{ang['id']} F placeholder mismatch: {v}")
                    if not is_valid_display_text(v):
                        errors.append(f"tax:{tid}.{ang['id']} invalid char in F: {v!r}")
            else:
                sv = ang.get("stemVariants") or []
                if len(sv) < 4:
                    errors.append(f"tax:{tid}.{ang['id']} has <4 stemVariants ({len(sv)})")
                if sv and sv[0] != ang["prompt"]:
                    errors.append(f"tax:{tid}.{ang['id']} stemVariants[0] != prompt")
                base_ph = set(PLACEHOLDER_RE.findall(ang["prompt"]))
                for v in sv:
                    tax_variant_count += 1
                    if set(PLACEHOLDER_RE.findall(v)) != base_ph:
                        errors.append(f"tax:{tid}.{ang['id']} placeholder mismatch: {v}")
                    if not is_valid_display_text(v):
                        errors.append(f"tax:{tid}.{ang['id']} invalid char: {v!r}")

    # 2. Exhaustive boundary-collision check across EVERY shard file x EVERY variant template!
    for sf in sorted(SHARDS_DIR.glob("*.json")):
        if sf.name in ("shard_manifest.json", "taxonomy_tree.json"):
            continue
        ch = json.loads(sf.read_text(encoding="utf-8"))
        pool = ch["p"]
        for tbl in ch["t"]:
            tid = tbl["type"]
            spec = ch.get("types", {}).get(tid) or all_types[tid]
            cols = spec["cols"]
            pcols = set(spec.get("poolCols", []))

            # Collect column positions right before '.', right after 'the ', or right after 'a '/'an '
            before_dot_cols: Set[str] = set()
            after_the_cols: Set[str] = set()
            after_art_cols: Set[str] = set()
            for ang in spec["angles"]:
                all_tpls: List[str] = []
                if ang["archetype"] == "GAUNTLET_SHATTER":
                    all_tpls.extend(ang.get("truePromptVariants") or [ang.get("truePrompt", "")])
                    all_tpls.extend(ang.get("falsePromptVariants") or [ang.get("falsePrompt", "")])
                else:
                    all_tpls.extend(ang.get("stemVariants") or [ang.get("prompt", "")])
                for tpl in all_tpls:
                    if RE_BAD_PUNCT.search(tpl) and tid not in ("math_num", "sub_math_spec_num"):
                        errors.append(f"Bad punct in template {tid}.{ang['id']}: {tpl!r}")
                    for c in cols:
                        if f"{{{c}}}." in tpl:
                            before_dot_cols.add(c)
                        if re.search(rf"\b[Tt]he \{{{c}\}}", tpl):
                            after_the_cols.add(c)
                        if re.search(rf"\b[Aa]n? \{{{c}\}}", tpl):
                            after_art_cols.add(c)
                    if "{fake}." in tpl and ang.get("fakeCol") is not None:
                        fc = int(ang["fakeCol"])
                        if 0 <= fc < len(cols):
                            before_dot_cols.add(cols[fc])

            for r in tbl["r"]:
                for ci, cname in enumerate(cols[:-1]):
                    v = pool[int(r[ci])] if ci in pcols else r[ci]
                    if not isinstance(v, str):
                        continue
                    if cname in before_dot_cols and v.endswith(".") and not v.endswith("..."):
                        errors.append(f"Dot-collision {sf.name}:{tid}.{cname} -> {v!r}")
                        before_dot_cols.discard(cname)
                    if cname in after_the_cols and v.lower().startswith("the "):
                        errors.append(f"the-The collision {sf.name}:{tid}.{cname} -> {v!r}")
                        after_the_cols.discard(cname)
                    if cname in after_art_cols:
                        # Only flag if raw template wrote 'a {col}' and value starts with vowel
                        if v and v[0].lower() in "aeiou" and not RE_A_VOWEL_SAFE.match(v):
                            # Check if template specifically had 'a {col}'
                            for ang in spec["angles"]:
                                tpls = (ang.get("stemVariants") or []) + (ang.get("truePromptVariants") or [])
                                if any(re.search(rf"\b[Aa] \{{{cname}\}}", t) for t in tpls):
                                    errors.append(f"a+vowel collision {sf.name}:{tid}.{cname} -> {v!r}")
                                    after_art_cols.discard(cname)
                                    break

    # 3. Verify Baseball `sub_bb_signature_lore` count, uniqueness, leak hygiene & era-matching stats
    sig_tbl = next((t for t in bb["t"] if t["type"] == "sub_bb_signature_lore"), None)
    if not sig_tbl:
        errors.append("Missing sub_bb_signature_lore table in subcat_baseball.json!")
    else:
        n_sig = len(sig_tbl["r"])
        if n_sig < 250:
            errors.append(f"Expected >= 250 sub_bb_signature_lore rows, got {n_sig}")
        for idx, r in enumerate(sig_tbl["r"]):
            slug, _, prompt, ans, d1, d2, d3, c1, c2, why, _ = r
            opts = [ans.strip().lower(), d1.strip().lower(), d2.strip().lower(), d3.strip().lower()]
            if len(set(opts)) != 4:
                errors.append(f"sig_lore[{idx}] {slug} duplicate opts: {opts}")
            al = ans.strip().lower()
            if len(al) >= 4:
                if al in prompt.lower():
                    errors.append(f"sig_lore[{idx}] {slug} prompt leak: {ans!r}")
                if al in c1.lower() or al in c2.lower():
                    errors.append(f"sig_lore[{idx}] {slug} clue leak: {ans!r}")
            for tx in (prompt, ans, d1, d2, d3, c1, c2, why):
                if not is_valid_display_text(tx):
                    errors.append(f"sig_lore[{idx}] {slug} invalid char in {tx!r}")
                if "(winner debut " in tx or "ML World Series" in tx:
                    errors.append(f"sig_lore[{idx}] {slug} format bug in {tx!r}")

    # 4. Verify byte size parity in taxonomy_tree.json & shard_manifest.json
    bb_disk_bytes = BASEBALL_SHARD_PATH.stat().st_size
    bb_meta = next(e for e in tax["subcatFiles"]["5"] if e["path"] == "subcat_baseball.json")
    if bb_meta["bytes"] != bb_disk_bytes:
        errors.append(f"taxonomy_tree subcat_baseball bytes mismatch: {bb_meta['bytes']} != {bb_disk_bytes}")

    # 5. Verify era-matched distractor quality for modern 2010s-2020s Baseball players!
    sys.path.insert(0, str(ROOT / "tools"))
    from validate_million_shards import pick_distractors_from_table

    bb_pool = bb["p"]
    modern_checks = 0
    modern_same_era = 0
    for tbl in bb["t"]:
        if tbl["type"] not in ("sub_bb_slugger", "sub_bb_pitcher", "sub_bb_awards_hof"):
            continue
        spec = tax["types"][tbl["type"]]
        era_col = spec["cols"].index("era")
        ang = spec["angles"][0]
        rows = tbl["r"]
        for ri, row in enumerate(rows):
            era_lbl = bb_pool[row[era_col]]
            if "2010_plus" not in era_lbl:
                continue
            modern_checks += 1
            qid = tbl["baseQid"] + ri * len(spec["angles"])
            dists = pick_distractors_from_table(rows, ri, spec, ang, bb_pool, qid, radius=60)
            # Check that distractors never include 1880s defunct clubs or 1910s players
            bad = any(
                k in d.lower()
                for d in dists
                for k in ("spiders", "beaneaters", "wolverines", "trojans", "stockings", "quakers", "grooms", "highlanders")
            )
            if not bad and len(dists) == 3:
                modern_same_era += 1

    era_pct = (100.0 * modern_same_era / max(1, modern_checks))
    if era_pct < 99.0:
        errors.append(f"Modern era distractor match rate {era_pct:.1f}% < 99.0% ({modern_same_era}/{modern_checks})")

    print("==========================================================================")
    print("UPGRADE #3 VERIFICATION — JEOPARDY HOOKS (ALL 12 DOMAINS) + BASEBALL LORE")
    print("==========================================================================")
    print(f"  shard_manifest.json : {len(manifest['types'])} types | {manifest_angle_count} angles | {manifest_variant_count} stem variants")
    print(f"  taxonomy_tree.json  : {len(tax['types'])} types | {tax_angle_count} angles | {tax_variant_count} stem variants")
    print(f"  subcat_baseball.json: {bb_disk_bytes:,} bytes | {len(bb['t'])} tables | {len(sig_tbl['r']) if sig_tbl else 0} Signature Diamond Classics")
    print(f"  Modern Era Matching : {modern_same_era}/{modern_checks} ({era_pct:.1f}%) clean modern distractors")
    print(f"  Errors              : {len(errors)}")
    print("==========================================================================")
    if errors:
        for e in errors[:40]:
            print(f"  [ERR] {e}")
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Upgrade Jeopardy stemVariants (all 12 domains) & Baseball Lore")
    parser.add_argument("--verify", action="store_true", help="Run read-only verification only")
    args = parser.parse_args()

    if args.verify:
        return verify_all()

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    tax = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    bb = json.loads(BASEBALL_SHARD_PATH.read_text(encoding="utf-8"))

    # 1. Upgrade Baseball table specs + register `sub_bb_signature_lore`
    update_baseball_table_specs_in_taxonomy(tax)

    # 2. Apply `stemVariants` / `truePromptVariants` / `falsePromptVariants` to ALL 45 manifest types
    m_angles = 0
    for tid, spec in manifest["types"].items():
        m_angles += apply_stem_variants_to_spec(tid, spec, MANIFEST_STEM_VARIANTS[tid])
        # Polish `geo_city:gc_reg` clue1 so Vietnamese cities ending in "An" don't trip "An has"
        if tid == "geo_city":
            for ang in spec["angles"]:
                if ang["id"] == "gc_reg":
                    ang["clue1"] = "Population of {name}: roughly {pop_k},000."

    # 3. Apply `stemVariants` / `truePromptVariants` / `falsePromptVariants` to ALL 33 specialist taxonomy types
    t_angles = 0
    for tid, spec in tax["types"].items():
        if tid == "sub_bb_signature_lore":
            continue
        t_angles += apply_stem_variants_to_spec(tid, spec, TAXONOMY_STEM_VARIANTS[tid])
        if tid == "sub_geo_city_deep":
            for ang in spec["angles"]:
                if ang["id"] == "sgc_reg":
                    ang["why"] = "{name} is situated in {region}, {country}."

    # 4. Upgrade `subcat_baseball.json` (era buckets + Triple Crown fix + 375 Signature Diamond Classics!)
    bb_upgraded, qid_ranges_by_type, bb_entities = upgrade_baseball_shard(bb, tax)
    bb_compact = json.dumps(bb_upgraded, ensure_ascii=False, separators=(",", ":"))
    BASEBALL_SHARD_PATH.write_text(bb_compact, encoding="utf-8")
    bb_bytes = BASEBALL_SHARD_PATH.stat().st_size

    # 5. Update `taxonomy_tree.json` byte sizes, QID ranges, counts & weighted rules
    update_taxonomy_metadata(tax, bb_bytes, bb_entities, qid_ranges_by_type)
    TAXONOMY_PATH.write_text(json.dumps(tax, ensure_ascii=False, indent=2), encoding="utf-8")

    # 6. Refresh exact base shard byte counts in `shard_manifest.json` & save
    total_shard_bytes = 0
    max_shard_bytes = 0
    for dom in manifest["domains"]:
        dom_bytes = 0
        for fm in dom.get("files", []):
            fp = SHARDS_DIR / fm["path"]
            if fp.exists():
                sz = fp.stat().st_size
                fm["bytes"] = sz
                dom_bytes += sz
                total_shard_bytes += sz
                max_shard_bytes = max(max_shard_bytes, sz)
        dom["bytes"] = dom_bytes
    manifest["totalShardBytes"] = total_shard_bytes
    manifest["maxShardBytes"] = max_shard_bytes
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Applied stemVariants to {m_angles} manifest angles + {t_angles} taxonomy angles + {len(SIGNATURE_DIAMOND_CLASSICS)} Baseball classics.")
    return verify_all()


if __name__ == "__main__":
    raise SystemExit(main())
