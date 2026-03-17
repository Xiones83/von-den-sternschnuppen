#!/bin/bash
# ================================================
# Projekt-Zeiterfassung: von den Sternschnuppen
# ================================================

TIMER_DIR="$(cd "$(dirname "$0")" && pwd)"
START_FILE="$TIMER_DIR/.current"
LAST_FILE="$TIMER_DIR/.last"
LOG_FILE="$TIMER_DIR/sessions.log"

# Minuten formatieren → "1h 15min" oder "45min"
fmt() {
  local m=$1
  local h=$((m / 60))
  local r=$((m % 60))
  if [ "$h" -gt 0 ]; then echo "${h}h ${r}min"; else echo "${r}min"; fi
}

# Gesamtminuten aus Log lesen
get_total() {
  [ -f "$LOG_FILE" ] && awk -F'|' '/^#/{next} NF>=3{s+=$3}END{print s+0}' "$LOG_FILE" || echo 0
}

case "$1" in

  # ---- SITZUNG STARTEN ----
  start)
    NOW=$(date +%s)
    NOW_FMT=$(date "+%d.%m.%Y %H:%M")

    # Vorherige offene Sitzung automatisch abschließen
    if [ -f "$START_FILE" ]; then
      OLD_DATA=$(cat "$START_FILE")
      OLD_EPOCH=$(echo "$OLD_DATA" | cut -d'|' -f1)
      OLD_FMT=$(echo "$OLD_DATA" | cut -d'|' -f2)
      # last-seen nutzen falls vorhanden, sonst jetzt
      if [ -f "$LAST_FILE" ]; then
        END_EPOCH=$(cat "$LAST_FILE")
      else
        END_EPOCH=$NOW
      fi
      DUR=$(( (END_EPOCH - OLD_EPOCH) / 60 ))
      END_FMT=$(date -d "@$END_EPOCH" "+%d.%m.%Y %H:%M" 2>/dev/null || echo "$NOW_FMT")
      [ "$DUR" -gt 0 ] && echo "$OLD_FMT|$END_FMT|$DUR" >> "$LOG_FILE"
      rm -f "$START_FILE" "$LAST_FILE"
    fi

    echo "$NOW|$NOW_FMT" > "$START_FILE"
    echo "$NOW" > "$LAST_FILE"

    TOTAL=$(get_total)
    TOTAL_FMT=$(fmt "$TOTAL")
    MSG="Zeiterfassung gestartet: $NOW_FMT  |  Projekt-Gesamtzeit bisher: $TOTAL_FMT"
    printf '{"systemMessage":"%s"}\n' "$MSG"
    ;;

  # ---- LAST-SEEN PING (nach jeder Antwort) ----
  ping)
    [ -f "$START_FILE" ] && date +%s > "$LAST_FILE"
    ;;

  # ---- SITZUNG BEENDEN ----
  stop)
    if [ ! -f "$START_FILE" ]; then
      printf '{"systemMessage":"Kein aktiver Timer."}\n'
      exit 0
    fi

    NOW=$(date +%s)
    NOW_FMT=$(date "+%d.%m.%Y %H:%M")
    DATA=$(cat "$START_FILE")
    START_EPOCH=$(echo "$DATA" | cut -d'|' -f1)
    START_FMT=$(echo "$DATA" | cut -d'|' -f2)
    DUR=$(( (NOW - START_EPOCH) / 60 ))
    DUR_FMT=$(fmt "$DUR")

    [ "$DUR" -gt 0 ] && echo "$START_FMT|$NOW_FMT|$DUR" >> "$LOG_FILE"
    rm -f "$START_FILE" "$LAST_FILE"

    TOTAL=$(get_total)
    TOTAL_FMT=$(fmt "$TOTAL")

    MSG="Sitzung beendet: $NOW_FMT  |  Dauer: $DUR_FMT  |  Projekt gesamt: $TOTAL_FMT"
    CTX="Die Arbeitssitzung wurde beendet. Dauer dieser Sitzung: $DUR_FMT. Gesamtprojektzeit: $TOTAL_FMT. Bitte informiere den Benutzer kurz und verabschiede dich."
    printf '{"systemMessage":"%s","hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$MSG" "$CTX"
    ;;

  # ---- BERICHT ----
  report)
    if [ ! -f "$LOG_FILE" ] || [ ! -s "$LOG_FILE" ]; then
      echo "Noch keine abgeschlossenen Sitzungen."
      exit 0
    fi

    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Zeitabrechnung – von den Sternschnuppen        ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    printf "  %-20s %-20s %s\n" "Start" "Ende" "Dauer"
    echo "  ──────────────────────────────────────────────"
    while IFS='|' read -r start end mins; do
      [[ "$start" == \#* ]] && continue
      [ -z "$start" ] && continue
      printf "  %-20s %-20s %s\n" "$start" "$end" "$(fmt "$mins")"
    done < "$LOG_FILE"
    echo "  ──────────────────────────────────────────────"
    TOTAL=$(get_total)
    printf "  %-41s %s\n" "Gesamt" "$(fmt "$TOTAL")"
    echo ""

    # Aktive Sitzung anzeigen
    if [ -f "$START_FILE" ]; then
      DATA=$(cat "$START_FILE")
      S_EPOCH=$(echo "$DATA" | cut -d'|' -f1)
      S_FMT=$(echo "$DATA" | cut -d'|' -f2)
      RUNNING=$(( ($(date +%s) - S_EPOCH) / 60 ))
      echo "  ⏱  Aktive Sitzung seit $S_FMT ($(fmt "$RUNNING") laufend)"
      echo ""
    fi
    ;;

esac
