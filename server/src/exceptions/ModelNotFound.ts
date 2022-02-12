import AbstractHttpException from "@app/exceptions/AbstractHttpException";

export default class ModelNotFound extends AbstractHttpException
{
    public statusCode = 404;
}
