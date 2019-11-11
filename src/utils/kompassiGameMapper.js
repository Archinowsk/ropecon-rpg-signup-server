// @flow
import moment from 'moment';
import type { KompassiGame } from 'flow/game.flow';

export const kompassiGameMapper = (
  games: $ReadOnlyArray<KompassiGame>
): $ReadOnlyArray<any> => {
  return games.map(game => {
    return {
      gameId: game.identifier,
      title: game.title,
      description: game.description,
      location: game.room_name,
      startTime: moment(game.start_time).format(),
      mins: game.length,
      tags: game.tags,
      genres: game.genres,
      styles: game.styles,
      language: game.language,
      endTime: game.end_time,
      people: game.formatted_hosts,
      minAttendance: game.min_players,
      maxAttendance: game.max_players,
      gameSystem: game.rpg_system,
      englishOk: game.english_ok,
      childrenFriendly: game.children_friendly,
      ageRestricted: game.age_restricted,
      beginnerFriendly: game.beginner_friendly,
      intendedForExperiencedParticipants:
        game.intended_for_experienced_participants,
      shortDescription: game.short_blurb,
      revolvingDoor: game.revolving_door,
    };
  });
};