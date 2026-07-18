import { Prod24Parser, Prod25Parser } from "@/data/build/parsers/prod2425";
import Prod26Parser from "@/data/build/parsers/prod26";
import type { EventId, ParticipationParser } from "@/data/types/base";

const prodParsers: Record<EventId, ParticipationParser> = {
  prod26: new Prod26Parser(
    "https://static.centraluniversity.ru/documents/social/rezultaty-i-polozhenie-prod-26.html",
  ),
  prod25: new Prod25Parser(
    "https://cdn.tbank.ru/static/documents/758836c6-3478-45ef-abe2-644e2ddcfccb.xlsx",
  ),
  prod24: new Prod24Parser(
    "https://cdn.tbank.ru/static/documents/e940a9e1-18da-47d0-9603-1f2350e50777.xlsx",
  ),
};

export default prodParsers;
