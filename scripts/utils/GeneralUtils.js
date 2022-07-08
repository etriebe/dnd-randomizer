export class GeneralUtils {
    static getIntegerFromWordNumber(number)
    {
      // This feels stupid but parseInt can't work with text format like we have.
      switch (number.toLowerCase())
      {
        case "one":
        case "once":
        case "1":
          return 1;
        case "two":
        case "twice":
        case "2":
          return 2;
        case "three":
        case "thrice":
        case "3":
          return 3;
        case "four":
        case "4":
          return 4;
        case "five":
        case "5":
          return 5;
        case "six":
        case "6":
          return 6;
        case "seven":
        case "7":
          return 7;
        case "eight":
        case "8":
          return 8;
        case "nine":
        case "9":
          return 9;
        case "ten":
        case "10":
          return 10;
        default:
          return null;
      }
    }

    static getCurrentDateTime() {
        let current = new Date();
        let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
        let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
        let dateTime = cDate + ' ' + cTime;
        return dateTime;
    };
}