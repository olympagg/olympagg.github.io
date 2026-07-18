import { sorted } from "@/lib/utils";

import type { EventData, TeamData } from "../../types";
import type { EventId, Team } from "../../types/base";

function getTeamScore(teamData: TeamData) {
  const first = teamData.participations[0];
  if (!first) {
    throw new Error("No participations found");
  }

  return first.teamScore ?? first.score;
}

function assignTeamRanks(eventTeams: Map<Team, TeamData>) {
  const teams = sorted(eventTeams.values(), (t) => -getTeamScore(t));

  for (let i = 0; i < teams.length; i++) {
    const current = teams[i]!;
    const prev = teams[i - 1];
    current.rank =
      prev !== undefined && getTeamScore(prev) === getTeamScore(current)
        ? prev.rank
        : i + 1;
  }
}

export function buildTeamData(
  eventsData: Map<EventId, EventData>,
): Map<EventId, Map<Team, TeamData>> {
  const teams = new Map<EventId, Map<Team, TeamData>>();

  for (const [eventId, event] of eventsData.entries()) {
    let eventTeams = teams.get(eventId);
    if (!eventTeams) {
      eventTeams = new Map<Team, TeamData>();
      teams.set(eventId, eventTeams);
    }

    for (const participation of event.participations) {
      const team = participation.team;
      if (!team) {
        continue;
      }

      let teamData = eventTeams.get(team);
      if (!teamData) {
        teamData = { eventId, team, rank: 0, participations: [] };
        eventTeams.set(team, teamData);
      }

      teamData.participations.push(participation);
    }

    assignTeamRanks(eventTeams);
  }

  return teams;
}
