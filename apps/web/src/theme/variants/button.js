class ButtonFactory {
  constructor() {
    return {
      default: new Default(),
      primary: new Primary(),
      secondary: new Secondary(),
      tertiary: new Tertiary(),
      list: new List(),
      anchor: new Anchor(),
      menu: new Menu()
    };
  }
}
export default ButtonFactory;

class Default {
  constructor() {
    return {
      fontFamily: "body",
      fontWeight: "body",
      borderRadius: "default",
      ":focus": {
        outline: "none"
      },
      ":hover": {
        cursor: "pointer"
      }
    };
  }
}

class Primary {
  constructor() {
    return {
      variant: "buttons.default",
      color: "fontSecondary",
      bg: "primary"
    };
  }
}

class Secondary {
  constructor() {
    return { variant: "buttons.default", color: "text", bg: "bgSecondary" };
  }
}

class Tertiary {
  constructor() {
    return {
      variant: "buttons.default",
      color: "text",
      bg: "transparent",
      border: "2px solid",
      borderColor: "border"
    };
  }
}

class List {
  constructor() {
    return {
      variant: "buttons.tertiary",
      border: "0px solid",
      borderBottom: "1px solid",
      borderRadius: 0,
      p: 2
    };
  }
}

class Anchor {
  constructor() {
    return {
      variant: "button.default",
      color: "primary",
      fontSize: "subBody",
      p: 0,
      m: 0
    };
  }
}

class Menu {
  constructor() {
    return {
      variant: "button.default",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "shade"
      }
    };
  }
}
