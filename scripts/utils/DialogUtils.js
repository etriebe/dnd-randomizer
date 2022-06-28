class DialogUtils {
    static checkBoxes(button, element, ulListID, liItemIdentifier, checkedStatus)
    {
        let invert = false;
        if (checkedStatus === "invert")
        {
            invert = true;
        }
        button.prop('disabled', true).addClass('disabled');
        const html = element;
        let $ul = html.find(ulListID).first();
        $ul.find(liItemIdentifier).each((index, item) => {
            let $checkBoxElement = $(item).find('input');
            if (invert)
            {
                $checkBoxElement[0].checked = !$checkBoxElement[0].checked;
            }
            else
            {
                $checkBoxElement[0].checked = checkedStatus;
            }
        });
        button.prop('disabled', false).removeClass('disabled');
    }

    static activateCheckAllListeners(html, element, ulListID, liItemIdentifier)
    {
        html.find('button#check-all').on('click', async (event) => {
			event.preventDefault();
			const $button = $(event.currentTarget);
			DialogUtils.checkBoxes($button, element, ulListID, liItemIdentifier, true);
		});

		html.find('button#uncheck-all').on('click', async (event) => {
			event.preventDefault();
			const $button = $(event.currentTarget);
			DialogUtils.checkBoxes($button, element, ulListID, liItemIdentifier, false);
		});

		html.find('button#invert').on('click', async (event) => {
			event.preventDefault();
			const $button = $(event.currentTarget);
			DialogUtils.checkBoxes($button, element, ulListID, liItemIdentifier, "invert");
		});
    }
}