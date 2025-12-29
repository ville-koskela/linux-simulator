import { type Translation, languageCodeSchema, languageCodes } from "@linux-simulator/shared";
import { Controller, Get, HttpException, HttpStatus, Param } from "@nestjs/common";
// biome-ignore lint/style/useImportType: For NestJS dependency injection
import { TranslationsService } from "./translations.service";

@Controller("translations")
export class TranslationsController {
  public constructor(private readonly translationsService: TranslationsService) {}

  @Get(":languageCode")
  public getTranslations(@Param("languageCode") languageCode: string): Translation {
    // Validate the language code
    const parsedLanguageCode = languageCodeSchema.safeParse(languageCode);

    if (!parsedLanguageCode.success) {
      const supportedLanguages = languageCodes.join(", ");
      throw new HttpException(
        `Invalid language code: ${languageCode}. Supported languages: ${supportedLanguages}`,
        HttpStatus.BAD_REQUEST
      );
    }

    return this.translationsService.getTranslations(parsedLanguageCode.data);
  }
}
