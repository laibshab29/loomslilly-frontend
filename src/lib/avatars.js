// src/lib/avatars.js

export const AVATARS = [
  { id: "avatar1", label: "Blue Jacket",  },
  { id: "avatar2", label: "Pink Jacket",  },
  { id: "avatar3", label: "Plaid Shirt",  },
  { id: "avatar4", label: "Glasses Girl", },
  { id: "avatar5", label: "Hijab Girl",   },
  { id: "avatar6", label: "Ponytail",     },
  { id: "avatar7", label: "Wavy Hair",    },
  { id: "avatar8", label: "Curly Hair",   },
];

import a1 from "../assets/avatars/avatar1.jpeg";
import a2 from "../assets/avatars/avatar2.jpeg";
import a3 from "../assets/avatars/avatar3.jpeg";
import a4 from "../assets/avatars/avatar4.jpg";
import a5 from "../assets/avatars/avatar5.jpg";
import a6 from "../assets/avatars/avatar6.jpg";
import a7 from "../assets/avatars/avatar7.jpg";
import a8 from "../assets/avatars/avatar8.jpg";

export const AVATAR_URLS = {
  avatar1: a1,
  avatar2: a2,
  avatar3: a3,
  avatar4: a4,
  avatar5: a5,
  avatar6: a6,
  avatar7: a7,
  avatar8: a8,
};

export function resolveAvatar(avatarUrl) {
  if (!avatarUrl) return null;
  if (AVATAR_URLS[avatarUrl]) return AVATAR_URLS[avatarUrl];
  return avatarUrl;
}